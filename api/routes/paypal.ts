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

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      orderId,
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
