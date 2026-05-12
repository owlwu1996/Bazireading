import { Router } from 'express';
import crypto from 'crypto';
import db from '../database.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'bazireading-secret-key-2024';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function generateToken(userId: number, email: string): string {
  const payload = { userId, email, iat: Math.floor(Date.now() / 1000) };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(base64Payload).digest('hex');
  return `${base64Payload}.${signature}`;
}

export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const [base64Payload, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(base64Payload).digest('hex');
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    const expTime = payload.iat + 7 * 24 * 60 * 60;
    if (Math.floor(Date.now() / 1000) > expTime) return null;

    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await db.prepare('SELECT id FROM users WHERE email = $1').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const salt = crypto.randomBytes(32).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const result = await db.prepare(`
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id
    `).get(email, `${salt}:${passwordHash}`, name || null);

    const token = generateToken(result.id, email);

    const userOrders = await db.prepare('SELECT * FROM orders WHERE user_id = $1').all(result.id);
    const hasActiveSubscription = userOrders.some((order: any) =>
      (order.plan_type === 'monthly' || order.plan_type === 'yearly') && order.status === 'completed'
    );
    const hasSinglePurchase = userOrders.some((order: any) =>
      ['single', 'full'].includes(order.plan_type) && order.status === 'completed'
    );

    res.json({
      success: true,
      token,
      user: {
        id: result.id,
        email,
        name: name || null,
      },
      isPaid: hasActiveSubscription || hasSinglePurchase,
      isSubscribed: hasActiveSubscription,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user: any = await db.prepare('SELECT * FROM users WHERE email = $1').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const [salt, storedHash] = user.password_hash.split(':');
    const passwordHash = hashPassword(password, salt);

    if (passwordHash !== storedHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.email);

    const userOrders = await db.prepare('SELECT * FROM orders WHERE user_id = $1').all(user.id);
    const hasActiveSubscription = userOrders.some((order: any) =>
      (order.plan_type === 'monthly' || order.plan_type === 'yearly') && order.status === 'completed'
    );
    const hasSinglePurchase = userOrders.some((order: any) =>
      ['single', 'full'].includes(order.plan_type) && order.status === 'completed'
    );
    
    // 特定邮箱自动解锁所有报告
    const isSpecialUser = user.email === '724454241@qq.com';

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      isPaid: isSpecialUser || hasActiveSubscription || hasSinglePurchase,
      isSubscribed: isSpecialUser || hasActiveSubscription,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user: any = await db.prepare('SELECT id, email, name FROM users WHERE id = $1').get(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userOrders = await db.prepare('SELECT * FROM orders WHERE user_id = $1').all(decoded.userId);
    const hasActiveSubscription = userOrders.some((order: any) =>
      (order.plan_type === 'monthly' || order.plan_type === 'yearly') && order.status === 'completed'
    );
    const hasSinglePurchase = userOrders.some((order: any) =>
      ['single', 'full'].includes(order.plan_type) && order.status === 'completed'
    );
    
    // 特定邮箱自动解锁所有报告
    const isSpecialUser = user.email === '724454241@qq.com';

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      isPaid: isSpecialUser || hasActiveSubscription || hasSinglePurchase,
      isSubscribed: isSpecialUser || hasActiveSubscription,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;