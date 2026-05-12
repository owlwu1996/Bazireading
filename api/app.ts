import express from 'express';
import cors from 'cors';
import baziRoutes from './routes/bazi.js';
import paymentRoutes from './routes/payment.js';
import paypalRoutes from './routes/paypal.js';
import paddleRoutes from './routes/paddle.js';
import lemonSqueezyRoutes from './routes/lemonSqueezy.js';
import nowpaymentsRoutes from './routes/nowpayments.js';
import authRoutes from './routes/auth.js';

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.use('/api/bazi', baziRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/paddle', paddleRoutes);
app.use('/api/lemonsqueezy', lemonSqueezyRoutes);
app.use('/api/nowpayments', nowpaymentsRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;