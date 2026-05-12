import Database from 'better-sqlite3';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

export const isPostgres = !!process.env.DATABASE_URL;
let pool: pg.Pool | null = null;
let sqliteDb: Database.Database | null = null;
let dbReady: Promise<void> = Promise.resolve();

if (isPostgres) {
  console.log('Initializing PostgreSQL connection...');
  console.log('Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20,
  });

  pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL error:', err);
  });

  async function initPostgresTables() {
    const client = await pool!.connect();
    try {
      console.log('Creating users table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT,
          name TEXT,
          avatar TEXT,
          role TEXT DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Users table created');

      console.log('Creating bazi_charts table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS bazi_charts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          name TEXT,
          birth_date TEXT NOT NULL,
          birth_time TEXT,
          birth_city TEXT,
          gender TEXT NOT NULL,
          four_pillars TEXT NOT NULL,
          five_elements TEXT NOT NULL,
          ten_gods TEXT NOT NULL,
          day_master TEXT NOT NULL,
          life_cycles TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      // Add name column if table already exists
      try { await client.query('ALTER TABLE bazi_charts ADD COLUMN IF NOT EXISTS name TEXT'); } catch {}
      console.log('Bazi charts table created');

      console.log('Creating readings table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS readings (
          id SERIAL PRIMARY KEY,
          bazi_id INTEGER NOT NULL,
          user_id INTEGER,
          type TEXT NOT NULL,
          sections TEXT NOT NULL,
          is_paid BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (bazi_id) REFERENCES bazi_charts(id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      console.log('Readings table created');

      console.log('Creating orders table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          plan_type TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          currency TEXT DEFAULT 'USD',
          status TEXT DEFAULT 'pending',
          payment_method TEXT,
          payment_id TEXT,
          visitor_id TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          paid_at TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      console.log('Orders table created');

      try {
        await client.query(`
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS visitor_id TEXT
        `);
        console.log('Added visitor_id column to orders table');
      } catch (err) {
        console.log('visitor_id column already exists or error:', err);
      }

      console.log('Creating compatibilities table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS compatibilities (
          id SERIAL PRIMARY KEY,
          bazi_a_id INTEGER NOT NULL,
          bazi_b_id INTEGER NOT NULL,
          user_id INTEGER,
          match_score INTEGER,
          analysis TEXT NOT NULL,
          is_paid BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (bazi_a_id) REFERENCES bazi_charts(id),
          FOREIGN KEY (bazi_b_id) REFERENCES bazi_charts(id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      console.log('Compatibilities table created');

      console.log('Creating subscriptions table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          plan_type TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('Subscriptions table created');

      console.log('All PostgreSQL tables initialized successfully');
    } finally {
      client.release();
    }
  }

  dbReady = initPostgresTables().catch(err => {
    console.error('Failed to initialize PostgreSQL tables:', err);
  });
} else {
  console.log('Initializing SQLite database...');
  const dbPath = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data', 'destinymap.db');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password_hash TEXT,
      name TEXT,
      avatar TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bazi_charts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      birth_date TEXT NOT NULL,
      birth_time TEXT,
      birth_city TEXT,
      gender TEXT NOT NULL,
      four_pillars TEXT NOT NULL,
      five_elements TEXT NOT NULL,
      ten_gods TEXT NOT NULL,
      day_master TEXT NOT NULL,
      life_cycles TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    // Add name column if table already exists
    try { db.prepare('ALTER TABLE bazi_charts ADD COLUMN name TEXT').run(); } catch {}

    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bazi_id INTEGER NOT NULL,
      user_id INTEGER,
      type TEXT NOT NULL,
      sections TEXT NOT NULL,
      is_paid BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bazi_id) REFERENCES bazi_charts(id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      plan_type TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      payment_id TEXT,
      visitor_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      paid_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS compatibilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bazi_a_id INTEGER NOT NULL,
      bazi_b_id INTEGER NOT NULL,
      user_id INTEGER,
      match_score INTEGER,
      analysis TEXT NOT NULL,
      is_paid BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bazi_a_id) REFERENCES bazi_charts(id),
      FOREIGN KEY (bazi_b_id) REFERENCES bazi_charts(id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_type TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      starts_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  try {
    sqliteDb.exec(`ALTER TABLE orders ADD COLUMN visitor_id TEXT`);
  } catch (err) {
    console.log('visitor_id column already exists or error:', err);
  }

  console.log('SQLite database initialized');
}

export const db = {
  prepare: (sql: string) => {
    if (isPostgres && pool) {
      return {
        get: async (...params: any[]) => {
          await dbReady;
          const result = await pool.query(sql, params);
          return result.rows[0] || null;
        },
        all: async (...params: any[]) => {
          await dbReady;
          const result = await pool.query(sql, params);
          return result.rows;
        },
        run: async (...params: any[]) => {
          await dbReady;
          const result = await pool.query(sql, params);
          return {
            lastInsertRowid: result.rows[0]?.id,
            changes: result.rowCount,
          };
        },
      };
    } else if (sqliteDb) {
      const stmt = sqliteDb.prepare(sql);
      return {
        get: (...params: any[]) => stmt.get(...params),
        all: (...params: any[]) => stmt.all(...params),
        run: (...params: any[]) => stmt.run(...params),
      };
    }
    throw new Error('Database not initialized');
  },
};

export default db;