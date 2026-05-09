const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_URLS = {
  baziCalculate: `${API_BASE}/api/bazi/calculate`,
  baziReading: `${API_BASE}/api/bazi/reading`,
  baziCompatibility: `${API_BASE}/api/bazi/compatibility`,
  paymentCreateIntent: `${API_BASE}/api/payment/create-intent`,
  paymentConfirm: `${API_BASE}/api/payment/confirm`,
  paypalCreateOrder: `${API_BASE}/api/paypal/create-order`,
  paypalCapture: `${API_BASE}/api/paypal/capture`,
};
