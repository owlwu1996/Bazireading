const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY || '';
const LEMON_SQUEEZY_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID || '';
const LEMON_SQUEEZY_WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';

const LEMON_SQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1';

interface CheckoutResponse {
  data: {
    id: string;
    attributes: {
      url: string;
      created_at: string;
    };
  };
  meta: {
    store_id: number;
    variant_id: number;
  };
}

export async function createCheckout(variantId: number, customerEmail?: string, customerName?: string): Promise<{ checkoutUrl: string }> {
  if (!LEMON_SQUEEZY_API_KEY || !LEMON_SQUEEZY_STORE_ID) {
    throw new Error('LemonSqueezy API credentials not configured');
  }

  const response = await fetch(`${LEMON_SQUEEZY_API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`,
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: customerEmail,
            name: customerName,
          },
          product_options: {
            redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`,
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: LEMON_SQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId.toString(),
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create checkout: ${JSON.stringify(error)}`);
  }

  const data: CheckoutResponse = await response.json();
  return { checkoutUrl: data.data.attributes.url };
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!LEMON_SQUEEZY_WEBHOOK_SECRET) {
    console.warn('LemonSqueezy webhook secret not configured');
    return true;
  }

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', LEMON_SQUEEZY_WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export function parseWebhookEvent(payload: any) {
  const eventName = payload.meta && payload.meta['event_name'];
  return {
    eventName,
    subscriptionId: payload.data?.id,
    customerEmail: payload.data?.attributes?.user_email,
    customerName: payload.data?.attributes?.user_name,
    status: payload.data?.attributes?.status,
    planType: payload.meta?.variant_id?.toString(),
    renewsAt: payload.data?.attributes?.renews_at,
    endsAt: payload.data?.attributes?.ends_at,
  };
}
