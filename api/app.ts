import express from 'express';
import cors from 'cors';
import baziRoutes from './routes/bazi';
import paymentRoutes from './routes/payment';
import paypalRoutes from './routes/paypal';
import paddleRoutes from './routes/paddle';

const app = express();

const allowedOrigins = [
  'https://bazireading.cc',
  'https://www.bazireading.cc',
  'https://bazireading.vercel.app',
  'https://bazireading-git-master-owlwu1996.vercel.app',
  'http://localhost:5173',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.use('/api/bazi', baziRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/paddle', paddleRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
