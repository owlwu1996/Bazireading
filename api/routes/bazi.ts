import { Router } from 'express';
import { calculateBazi } from '../services/baziCalculation';
import { generateReading, generateCompatibilityReading } from '../services/readingGeneration';
import db from '../database';

const router = Router();

router.post('/calculate', (req, res) => {
  try {
    const { birthDate, birthTime, birthCity, gender } = req.body;

    if (!birthDate || !gender) {
      return res.status(400).json({ error: 'Birth date and gender are required' });
    }

    const chart = calculateBazi(birthDate, birthTime || '12:00', gender);

    const stmt = db.prepare(`
      INSERT INTO bazi_charts (user_id, birth_date, birth_time, birth_city, gender, four_pillars, five_elements, ten_gods, day_master, life_cycles)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      null,
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
      dbId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error('Bazi calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate bazi chart' });
  }
});

router.post('/reading', (req, res) => {
  try {
    const { baziId, type = 'full' } = req.body;

    const chartStmt = db.prepare('SELECT * FROM bazi_charts WHERE id = ?');
    const row = chartStmt.get(baziId) as any;

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

    const stmt = db.prepare(`
      INSERT INTO readings (bazi_id, user_id, type, sections, is_paid)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      baziId,
      null,
      type,
      JSON.stringify(reading.sections),
      type === 'full' ? 0 : 1
    );

    res.json({
      ...reading,
      dbId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error('Reading generation error:', error);
    res.status(500).json({ error: 'Failed to generate reading' });
  }
});

router.post('/compatibility', (req, res) => {
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

router.get('/chart/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM bazi_charts WHERE id = ?');
    const row = stmt.get(id) as any;

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

export default router;
