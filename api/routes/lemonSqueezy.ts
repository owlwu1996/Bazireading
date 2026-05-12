import { Router } from 'express';
import { createCheckout, parseWebhookEvent } from '../services/lemonSqueezy.js';
import db from '../database.js';

const router = Router();

const plans: Record<string, { variantId: number; name: string }> = {
  monthly: { variantId: parseInt(process.env.LEMON_MONTHLY_VARIANT_ID || '0') || 123456, name: 'Monthly Subscription' },
  yearly: { variantId: parseInt(process.env.LEMON_YEARLY_VARIANT_ID || '0') || 123457, name: 'Yearly Subscription' },
  single: { variantId: parseInt(process.env.LEMON_SINGLE_VARIANT_ID || '0') || 123458, name: 'Single Report' },
};

router.post('/create-checkout', async (req, res) => {
  try {
    const { planType, email, name } = req.body;

    if (!planType || !plans[planType]) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    const plan = plans[planType];
    const checkout = await createCheckout(plan.variantId, email, name);

    res.json({
      success: true,
      checkoutUrl: checkout.checkoutUrl,
    });
  } catch (error: any) {
    console.error('LemonSqueezy checkout error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-signature'] as string;
    const payload = JSON.stringify(req.body);

    if (signature) {
      const crypto = require('crypto');
      const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(payload).digest('hex');

      if (digest !== signature) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = parseWebhookEvent(req.body);
    console.log('LemonSqueezy webhook event:', event.eventName);

    if (event.eventName === 'subscription_created' || event.eventName === 'subscription_updated') {
      if (event.customerEmail && event.status) {
        const user: any = await db.prepare('SELECT id FROM users WHERE email = $1').get(event.customerEmail);

        if (user) {
          const planType = event.planType === plans.yearly.variantId.toString() ? 'yearly' : 'monthly';
          const status = event.status === 'active' ? 'completed' : 'pending';

          if (event.eventName === 'subscription_created') {
            await db.prepare(`
              INSERT INTO orders (user_id, plan_type, amount, currency, status, payment_method, payment_id, paid_at)
              VALUES ($1, $2, $3, 'USD', $4, 'lemonsqueezy', $5, CURRENT_TIMESTAMP)
            `).run(user.id, planType, 0, status, event.subscriptionId);
          } else if (event.status === 'cancelled' || event.status === 'expired') {
            await db.prepare(`
              UPDATE orders SET status = $1 WHERE payment_id = $2
            `).run('cancelled', event.subscriptionId);
          }
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
