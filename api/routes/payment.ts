import { Router } from 'express';
import db from '../database.js';

const router = Router();

const PLANS = {
  single: { amount: 9.9, name: 'Single Report' },
  monthly: { amount: 9.9, name: 'Monthly Subscription' },
  yearly: { amount: 79, name: 'Yearly Subscription' },
};

router.post('/create-intent', (req, res) => {
  try {
    const { plan, paymentMethod } = req.body;

    if (!PLANS[plan as keyof typeof PLANS]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const planInfo = PLANS[plan as keyof typeof PLANS];
    const orderId = `order_${Date.now()}`;

    const stmt = db.prepare(`
      INSERT INTO orders (user_id, plan_type, amount, currency, status, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      null,
      plan,
      planInfo.amount,
      'USD',
      'pending',
      paymentMethod
    );

    res.json({
      orderId: result.lastInsertRowid,
      clientSecret: orderId,
      amount: planInfo.amount,
      currency: 'USD',
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

router.post('/confirm', (req, res) => {
  try {
    const { orderId } = req.body;

    const updateStmt = db.prepare(`
      UPDATE orders SET status = 'completed', paid_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateStmt.run(orderId);

    const orderStmt = db.prepare('SELECT * FROM orders WHERE id = ?');
    const order = orderStmt.get(orderId) as any;

    if (order && (order.plan_type === 'monthly' || order.plan_type === 'yearly')) {
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
      subStmt.run(order.user_id || 0, order.plan_type, expiresAt.toISOString());
    }

    res.json({ success: true, message: 'Payment confirmed' });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

router.get('/subscription/status', (req, res) => {
  try {
    const userId = req.query.userId || 0;
    const stmt = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?');
    const sub = stmt.get(userId) as any;

    if (!sub) {
      return res.json({ isActive: false, plan: null, expiresAt: null });
    }

    const isActive = sub.status === 'active' && new Date(sub.expires_at) > new Date();

    res.json({
      isActive,
      plan: sub.plan_type,
      expiresAt: sub.expires_at,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

export default router;
