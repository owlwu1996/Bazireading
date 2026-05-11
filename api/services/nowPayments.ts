const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || '';
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || '';
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

interface PaymentRequest {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  order_id?: string;
  order_description?: string;
  ipn_callback_url?: string;
  success_url?: string;
  cancel_url?: string;
}

interface PaymentResponse {
  id: number;
  invoice_id: string;
  order_id: string;
  payment_status: string;
  pay_address: string;
  pay_amount: string;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  created_at: string;
  updated_at: string;
}

export async function createPayment(params: {
  amount: number;
  currency?: string;
  orderId?: string;
  description?: string;
  email?: string;
}): Promise<{ paymentUrl: string; paymentId: string }> {
  if (!NOWPAYMENTS_API_KEY) {
    throw new Error('NowPayments API key not configured');
  }

  const paymentData: any = {
    price_amount: params.amount,
    price_currency: params.currency || 'USD',
    order_id: params.orderId || `order_${Date.now()}`,
    order_description: params.description || 'Bazi Reading Purchase',
    ipn_callback_url: `${process.env.API_URL || 'https://bazireading-api.onrender.com'}/api/nowpayments/webhook`,
    success_url: `${process.env.FRONTEND_URL || 'https://bazireading.cc'}/payment-success`,
    cancel_url: `${process.env.FRONTEND_URL || 'https://bazireading.cc'}/pricing`,
  };

  const response = await fetch(`${NOWPAYMENTS_API_URL}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': NOWPAYMENTS_API_KEY,
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`NowPayments API error: ${JSON.stringify(error)}`);
  }

  const payment: PaymentResponse = await response.json();
  
  return {
    paymentUrl: `https://nowpayments.io/payment/?paymentId=${payment.id}`,
    paymentId: payment.id.toString(),
  };
}

export async function getPaymentStatus(paymentId: string): Promise<{
  status: string;
  payAmount?: string;
  payCurrency?: string;
}> {
  if (!NOWPAYMENTS_API_KEY) {
    throw new Error('NowPayments API key not configured');
  }

  const response = await fetch(`${NOWPAYMENTS_API_URL}/payment/${paymentId}`, {
    headers: {
      'x-api-key': NOWPAYMENTS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get payment status');
  }

  const payment: PaymentResponse = await response.json();
  
  return {
    status: payment.payment_status,
    payAmount: payment.pay_amount,
    payCurrency: payment.pay_currency,
  };
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!NOWPAYMENTS_IPN_SECRET) {
    console.warn('NowPayments IPN secret not configured');
    return true;
  }

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', NOWPAYMENTS_IPN_SECRET);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export function parsePaymentStatus(status: string): {
  isPaid: boolean;
  isFailed: boolean;
  statusText: string;
} {
  const paidStatuses = ['finished', 'partially_paid', 'confirmed'];
  const failedStatuses = ['expired', 'cancelled', 'failed'];
  
  return {
    isPaid: paidStatuses.includes(status),
    isFailed: failedStatuses.includes(status),
    statusText: status,
  };
}
