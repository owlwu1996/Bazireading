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
    const { plan, userId } = req.body;

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
      userId || null,
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
    const { paypalOrderId, userId } = req.body;

    const captureResult = await captureOrder(paypalOrderId);

    if (captureResult.status === 'COMPLETED') {
      const orderStmt = db.prepare('SELECT * FROM orders WHERE payment_id = ?');
      const order = orderStmt.get(paypalOrderId) as any;

      if (order) {
        const updateStmt = db.prepare(`
          UPDATE orders SET status = 'completed', paid_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        updateStmt.run(order.id);

        if (userId && userId > 0) {
          const linkStmt = db.prepare(`
            UPDATE orders SET user_id = ? WHERE id = ?
          `);
          linkStmt.run(userId, order.id);

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
            subStmt.run(userId, order.plan_type, expiresAt.toISOString());
          }
        }
      }

      res.json({ success: true, message: 'Payment completed', orderId: order?.id });
    } else {
      res.status(400).json({ error: 'Payment not completed', status: captureResult.status });
    }
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ error: 'Failed to capture payment' });
  }
});

router.post('/link-order', (req, res) => {
  try {
    const { orderId, userId } = req.body;

    if (!orderId || !userId) {
      return res.status(400).json({ error: 'Order ID and User ID are required' });
    }

    const stmt = db.prepare('UPDATE orders SET user_id = ? WHERE id = ?');
    stmt.run(userId, orderId);

    res.json({ success: true, message: 'Order linked to user' });
  } catch (error) {
    console.error('Link order error:', error);
    res.status(500).json({ error: 'Failed to link order' });
  }
});

export default router;
