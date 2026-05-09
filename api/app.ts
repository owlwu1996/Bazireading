import express from 'express';
import cors from 'cors';
import baziRoutes from './routes/bazi';
import paymentRoutes from './routes/payment';

const app = express();

const allowedOrigins = [
  'https://bazireading.vercel.app',
  'https://bazireading-git-master-owlwu1996.vercel.app',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/bazi', baziRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
