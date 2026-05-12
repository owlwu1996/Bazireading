import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import baziRoutes from './routes/bazi';
import paymentRoutes from './routes/payment';
import paypalRoutes from './routes/paypal';
import paddleRoutes from './routes/paddle';
import lemonSqueezyRoutes from './routes/lemonSqueezy';
import nowpaymentsRoutes from './routes/nowpayments';
import authRoutes from './routes/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve frontend static files (if built)
import fs from 'fs';
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback: all non-API routes serve index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

export default app;
