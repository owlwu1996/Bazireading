import { Router } from 'express';
import { createOrder, captureOrder } from '../services/paypal';
import db from '../database';

const router = Router();

const PLANS = {
  single: { amount: 9.9, name: 'Single Report' },
  monthly: { amount: 9.9, name: 'Monthly Subscription' },
  yearly: { amount: 79, name: 'Yearly Subscription' },
};

router.post('/create-order', async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan as keyof typeof PLANS]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const planInfo = PLANS[plan as keyof typeof PLANS];

    const paypalOrder = await createOrder(planInfo.amount, 'USD');

    const stmt = db.prepare(`
      INSERT INTO orders (user_id, plan_type, amount, currency, status, payment_method, payment_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      null,
      plan,
      planInfo.amount,
      'USD',
      'pending',
      'paypal',
      paypalOrder.id
    );

    res.json({
      orderId: result.lastInsertRowid,
      paypalOrderId: paypalOrder.id,
      amount: planInfo.amount,
      currency: 'USD',
    });
  } catch (error) {
    console.error('PayPal create order error:', error);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

router.post('/capture', async (req, res) => {
  try {
    const { paypalOrderId } = req.body;

    const captureResult = await captureOrder(paypalOrderId);

    if (captureResult.status === 'COMPLETED') {
      const orderStmt = db.prepare('SELECT * FROM orders WHERE payment_id = ?');
      const order = orderStmt.get(paypalOrderId) as any;

      if (order && order.user_id && order.user_id > 0) {
        const updateStmt = db.prepare(`
          UPDATE orders SET status = 'completed', paid_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        updateStmt.run(order.id);

        if (order.plan_type === 'monthly' || order.plan_type === 'yearly') {
          const expiresAt = new Date();
          if (order.plan_type === 'monthly') {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
          } else {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          }

          const subStmt = db.prepare(`
            INSERT OR REPLACE INTO subscriptions (user_id, plan_type, status, expires_at)
            VALUES (?, ?, 'active', ?)
          `);
          subStmt.run(order.user_id, order.plan_type, expiresAt.toISOString());
        }
      }

      res.json({ success: true, message: 'Payment completed' });
    } else {
      res.status(400).json({ error: 'Payment not completed', status: captureResult.status });
    }
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ error: 'Failed to capture payment' });
  }
});

export default router;
