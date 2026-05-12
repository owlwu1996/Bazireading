const API_BASE = import.meta.env.VITE_API_URL || 'https://bazi-reading.onrender.com';

export const API_URLS = {
  bazi: `${API_BASE}/api/bazi`,
  baziHistory: `${API_BASE}/api/bazi/history`,
  baziChart: (id: number) => `${API_BASE}/api/bazi/chart/${id}`,
  baziCalculate: `${API_BASE}/api/bazi/calculate`,
  baziReading: `${API_BASE}/api/bazi/reading`,
  baziCompatibility: `${API_BASE}/api/bazi/compatibility`,
  paymentCreateIntent: `${API_BASE}/api/payment/create-intent`,
  paymentConfirm: `${API_BASE}/api/payment/confirm`,
  paypalCreateOrder: `${API_BASE}/api/paypal/create-order`,
  paypalCapture: `${API_BASE}/api/paypal/capture`,
};
