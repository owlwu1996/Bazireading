import express from 'express';
import cors from 'cors';
import baziRoutes from './routes/bazi';
import paymentRoutes from './routes/payment';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/bazi', baziRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
