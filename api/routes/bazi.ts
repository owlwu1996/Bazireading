import { Router } from 'express';
import { calculateBazi } from '../services/baziCalculation';
import { generateReading, generateCompatibilityReading } from '../services/readingGeneration';
import db from '../database';
import { verifyToken } from './auth';

const router = Router();

router.post('/calculate', async (req, res) => {
  try {
    const { birthDate, birthTime, birthCity, gender } = req.body;

    if (!birthDate || !gender) {
      return res.status(400).json({ error: 'Birth date and gender are required' });
    }

    const chart = calculateBazi(birthDate, birthTime || '12:00', gender);

    let userId: number | null = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (decoded) {
          try {
            const userCheck = await db.prepare('SELECT id FROM users WHERE id = $1').get(decoded.userId);
            if (userCheck) {
              userId = decoded.userId;
            }
          } catch (dbErr) {
            console.log('User check failed, saving without user association');
          }
        }
      }
    } catch (err) {
      console.log('No valid auth token, saving chart without user');
    }

    const result = await db.prepare(`
      INSERT INTO bazi_charts (user_id, birth_date, birth_time, birth_city, gender, four_pillars, five_elements, ten_gods, day_master, life_cycles)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `).get(
      userId,
      birthDate,
      birthTime || '12:00',
      birthCity || '',
      gender,
      JSON.stringify(chart.fourPillars),
      JSON.stringify(chart.fiveElements),
      JSON.stringify(chart.tenGods),
      JSON.stringify(chart.dayMaster),
      JSON.stringify(chart.lifeCycles)
    );

    res.json({
      ...chart,
      dbId: result.id,
      birthDate,
      birthTime: birthTime || '12:00',
      birthCity: birthCity || '',
      gender,
    });
  } catch (error) {
    console.error('Bazi calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate bazi chart' });
  }
});

router.post('/reading', async (req, res) => {
  try {
    const { baziId, type = 'full' } = req.body;

    const row: any = await db.prepare('SELECT * FROM bazi_charts WHERE id = $1').get(baziId);

    if (!row) {
      return res.status(404).json({ error: 'Bazi chart not found' });
    }

    const chart = {
      id: row.id.toString(),
      fourPillars: JSON.parse(row.four_pillars),
      fiveElements: JSON.parse(row.five_elements),
      tenGods: JSON.parse(row.ten_gods),
      dayMaster: JSON.parse(row.day_master),
      lifeCycles: JSON.parse(row.life_cycles),
    };

    const reading = generateReading(chart, type);

    const result = await db.prepare(`
      INSERT INTO readings (bazi_id, user_id, type, sections, is_paid)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `).get(
      baziId,
      row.user_id,
      type,
      JSON.stringify(reading.sections),
      type === 'full' ? false : true
    );

    res.json({
      ...reading,
      dbId: result.id,
    });
  } catch (error) {
    console.error('Reading generation error:', error);
    res.status(500).json({ error: 'Failed to generate reading' });
  }
});

router.post('/compatibility', async (req, res) => {
  try {
    const { personA, personB } = req.body;

    const chartA = calculateBazi(personA.birthDate, personA.birthTime || '12:00', personA.gender);
    const chartB = calculateBazi(personB.birthDate, personB.birthTime || '12:00', personB.gender);

    const reading = generateCompatibilityReading(chartA, chartB);

    res.json({
      chartA,
      chartB,
      reading,
    });
  } catch (error) {
    console.error('Compatibility calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate compatibility' });
  }
});

router.get('/chart/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const row: any = await db.prepare('SELECT * FROM bazi_charts WHERE id = $1').get(id);

    if (!row) {
      return res.status(404).json({ error: 'Chart not found' });
    }

    res.json({
      id: row.id,
      fourPillars: JSON.parse(row.four_pillars),
      fiveElements: JSON.parse(row.five_elements),
      tenGods: JSON.parse(row.ten_gods),
      dayMaster: JSON.parse(row.day_master),
      lifeCycles: JSON.parse(row.life_cycles),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chart' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const userId = decoded.userId;

    const charts = await db.prepare(`
      SELECT c.*, r.id as reading_id, r.type as reading_type, r.sections as reading_sections, r.created_at as reading_date
      FROM bazi_charts c
      LEFT JOIN readings r ON c.id = r.bazi_id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
      LIMIT 20
    `).all(userId);

    const formattedCharts = charts.map((row: any) => ({
      id: row.id,
      birthDate: row.birth_date,
      birthTime: row.birth_time,
      birthCity: row.birth_city,
      gender: row.gender,
      readingId: row.reading_id,
      readingType: row.reading_type,
      readingSections: row.reading_sections ? JSON.parse(row.reading_sections) : null,
      createdAt: row.created_at,
      readingDate: row.reading_date,
    }));

    res.json({ charts: formattedCharts });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
