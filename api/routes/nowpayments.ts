import { Router } from 'express';
import { createPayment, getPaymentStatus, verifyWebhookSignature, parsePaymentStatus } from '../services/nowPayments';
import db from '../database';

const router = Router();

const plans: Record<string, { amount: number; name: string }> = {
  single: { amount: 9.9, name: 'Single Report' },
  monthly: { amount: 9.9, name: 'Monthly Subscription' },
  yearly: { amount: 79, name: 'Yearly Subscription' },
};

router.post('/create-payment', async (req, res) => {
  try {
    const { planType, email, name } = req.body;

    if (!planType || !plans[planType]) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    const plan = plans[planType];
    const orderId = `${planType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment = await createPayment({
      amount: plan.amount,
      currency: 'USD',
      orderId,
      description: plan.name,
      email,
    });

    res.json({
      success: true,
      paymentUrl: payment.paymentUrl,
      paymentId: payment.paymentId,
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

    console.log('NowPayments webhook:', { payment_status, order_id, email: req.body.email });

    const paymentInfo = parsePaymentStatus(payment_status);
    console.log('Payment parsed status:', paymentInfo);

    if (paymentInfo.isPaid) {
      const orderParts = (order_id || '').split('_');
      const planType = orderParts[0] || 'single';

      let userId: number | null = null;
      let userEmail: string | null = null;

      if (req.body.email) {
        userEmail = req.body.email;
        const user: any = await db.prepare('SELECT id FROM users WHERE email = $1').get(req.body.email);
        if (user) {
          userId = user.id;
        }
      }

      const existingOrder = await db.prepare(`
        SELECT id FROM orders WHERE payment_id = $1
      `).get(order_id);

      if (!existingOrder) {
        await db.prepare(`
          INSERT INTO orders (user_id, plan_type, amount, currency, status, payment_method, payment_id, paid_at)
          VALUES ($1, $2, $3, 'USD', 'completed', 'nowpayments', $4, CURRENT_TIMESTAMP)
        `).run(userId, planType, price_amount || plans[planType]?.amount || 0, order_id);

        console.log('Order created successfully:', { order_id, planType, userId });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

router.get('/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await getPaymentStatus(paymentId);
    
    res.json({
      status: payment.status,
      isPaid: parsePaymentStatus(payment.status).isPaid,
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

export default router;
