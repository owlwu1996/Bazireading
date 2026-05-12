import { Router } from 'express';
import crypto from 'crypto';
import db from '../database';

const router = Router();

// Paddle webhook secret (from Paddle Dashboard > Developer Tools > Notifications)
const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || '';

// Verify Paddle webhook signature
function verifyWebhookSignature(
  signature: string,
  timestamp: string,
  rawBody: string
): boolean {
  if (!PADDLE_WEBHOOK_SECRET) {
    console.warn('PADDLE_WEBHOOK_SECRET not set, skipping signature verification');
    return true;
  }

  try {
    const signedPayload = `${timestamp}:${rawBody}`;
    const hmac = crypto
      .createHmac('sha256', PADDLE_WEBHOOK_SECRET)
      .update(signedPayload)
      .digest('hex');
    return hmac === signature;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

// Handle Paddle webhooks
router.post('/webhook', (req, res) => {
  try {
    const signature = req.headers['paddle-signature'] as string;
    const timestamp = req.headers['paddle-request-timestamp'] as string;
    const rawBody = JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifyWebhookSignature(signature, timestamp, rawBody)) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    const eventType = event.event_type;

    console.log('Paddle webhook received:', eventType, event.data?.id);

    switch (eventType) {
      case 'transaction.completed': {
        const transaction = event.data;
        const customData = transaction.custom_data || {};
        const plan = customData.plan || 'single';
        const customerId = transaction.customer_id;
        const amount = transaction.details?.totals?.total || 0;
        const currency = transaction.currency_code || 'USD';

        // Record the order
        const stmt = db.prepare(`
          INSERT INTO orders (user_id, plan_type, amount, currency, status, payment_method, payment_id, paid_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        const result = stmt.run(
          customerId || null,
          plan,
          amount / 100, // Paddle amounts are in cents
          currency,
          'completed',
          'paddle',
          transaction.id
        );

        // Handle subscriptions
        if (plan === 'monthly' || plan === 'yearly') {
          const expiresAt = new Date();
          if (plan === 'monthly') {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
          } else {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          }

          const subStmt = db.prepare(`
            INSERT OR REPLACE INTO subscriptions (user_id, plan_type, status, expires_at)
            VALUES (?, ?, 'active', ?)
          `);
          subStmt.run(customerId || 0, plan, expiresAt.toISOString());
        }

        console.log('Payment recorded:', result.lastInsertRowid);
        break;
      }

      case 'subscription.created':
      case 'subscription.activated': {
        const subscription = event.data;
        const customerId = subscription.customer_id;
        const plan = subscription.items?.[0]?.price?.name?.toLowerCase().includes('year')
          ? 'yearly'
          : 'monthly';

        const stmt = db.prepare(`
          INSERT OR REPLACE INTO subscriptions (user_id, plan_type, status, expires_at)
          VALUES (?, ?, 'active', ?)
        `);
        stmt.run(
          customerId || 0,
          plan,
          subscription.current_billing_period?.ends_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        );
        break;
      }

      case 'subscription.canceled':
      case 'subscription.past_due': {
        const subscription = event.data;
        const customerId = subscription.customer_id;

        const stmt = db.prepare(`
          UPDATE subscriptions SET status = ? WHERE user_id = ?
        `);
        stmt.run(eventType === 'subscription.canceled' ? 'canceled' : 'past_due', customerId || 0);
        break;
      }

      default:
        console.log('Unhandled Paddle event:', eventType);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Paddle webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get Paddle public key/config for frontend
router.get('/config', (req, res) => {
  res.json({
    clientToken: process.env.PADDLE_CLIENT_TOKEN || 'test_7d279f1a349e22d30de1c93bf2c9e',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  });
});

export default router;
