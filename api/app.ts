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

const allowedOrigins = [
  'https://bazireading.cc',
  'https://www.bazireading.cc',
  'https://bazireading.vercel.app',
  'https://bazireading-git-master-owlwu1996.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: function(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['*'],
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/bazi', baziRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/paddle', paddleRoutes);
app.use('/api/lemonsqueezy', lemonSqueezyRoutes);
app.use('/api/nowpayments', nowpaymentsRoutes);
app.use('/api/auth', authRoutes);

app.options('*', cors(corsOptions));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;