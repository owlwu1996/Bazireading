import { Router } from 'express';
import { createPayment, getPaymentStatus, verifyWebhookSignature, parsePaymentStatus } from '../services/nowPayments';
import db from '../database';

const router = Router();

const plans: Record<string, { amount: number; name: string }> = {
  full: { amount: 29, name: 'Full Report' },
};

router.post('/create-payment', async (req, res) => {
  try {
    const { planType, email, name } = req.body;

    if (!planType || !plans[planType]) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required for payment' });
    }

    const plan = plans[planType];
    const orderId = `${planType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const user: any = await db.prepare('SELECT id FROM users WHERE email = $1').get(email);
    
    const payment = await createPayment({
      amount: plan.amount,
      currency: 'USD',
      orderId,
      description: plan.name,
      email,
    });

    await db.prepare(`
      INSERT INTO orders (user_id, plan_type, amount, currency, status, payment_method, payment_id)
      VALUES ($1, $2, $3, 'USD', 'pending', 'nowpayments', $4)
    `).run(user?.id || null, planType, plan.amount, orderId);

    res.json({
      success: true,
      paymentUrl: payment.paymentUrl,
      paymentId: payment.paymentId,
      orderId,
    });
  } catch (error: any) {
    console.error('NowPayments checkout error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-nowpayments-sign'] as string;
    const payload = JSON.stringify(req.body);

    if (signature && !verifyWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { payment_status, order_id, pay_amount, pay_currency, price_amount } = req.body;

    console.log('NowPayments webhook:', { payment_status, order_id });

    const paymentInfo = parsePaymentStatus(payment_status);

    if (paymentInfo.isPaid) {
      const orderParts = (order_id || '').split('_');
      const planType = orderParts[0] || 'single';

      const existingOrder: any = await db.prepare(`
        SELECT id, user_id FROM orders WHERE payment_id = $1
      `).get(order_id);

      if (!existingOrder) {
        let userId: number | null = null;
        if (req.body.email) {
          const user: any = await db.prepare('SELECT id FROM users WHERE email = $1').get(req.body.email);
          if (user) {
            userId = user.id;
          }
        }

        await db.prepare(`
          INSERT INTO orders (user_id, plan_type, amount, currency, status, payment_method, payment_id, paid_at)
          VALUES ($1, $2, $3, 'USD', 'completed', 'nowpayments', $4, CURRENT_TIMESTAMP)
        `).run(userId, planType, price_amount || plans[planType]?.amount || 0, order_id);

        console.log('Order created successfully:', { order_id, planType, userId });
      } else if (existingOrder.status !== 'completed') {
        await db.prepare(`
          UPDATE orders SET status = 'completed', paid_at = CURRENT_TIMESTAMP
          WHERE payment_id = $1
        `).run(order_id);
        
        console.log('Order updated to completed:', { order_id });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order: any = await db.prepare(`
      SELECT o.*, u.email as user_email, u.name as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.payment_id = $1
    `).get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderId: order.payment_id,
      status: order.status,
      planType: order.plan_type,
      amount: order.amount,
      email: order.user_email,
    });
  } catch (error) {
    console.error('Order status error:', error);
    res.status(500).json({ error: 'Failed to get order status' });
  }
});

export default router;