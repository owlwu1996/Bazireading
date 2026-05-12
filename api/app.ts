import express from 'express';
import cors from 'cors';
import baziRoutes from './routes/bazi';
import paymentRoutes from './routes/payment';
import paypalRoutes from './routes/paypal';
import paddleRoutes from './routes/paddle';
import lemonSqueezyRoutes from './routes/lemonSqueezy';
import nowpaymentsRoutes from './routes/nowpayments';
import authRoutes from './routes/auth';

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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