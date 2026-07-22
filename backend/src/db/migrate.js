import pool from './connection.js'

async function migrate() {
  console.log('[Migrate] Running migrations...')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)
  console.log('[Migrate] ✓ users table')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      description TEXT,
      url VARCHAR(500) UNIQUE,
      role_category VARCHAR(100),
      scraped_at TIMESTAMP DEFAULT NOW()
    );
  `)
  console.log('[Migrate] ✓ jobs table')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS job_skills (
      id SERIAL PRIMARY KEY,
      job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
      skill VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)
  console.log('[Migrate] ✓ job_skills table')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS role_skill_rankings (
      id SERIAL PRIMARY KEY,
      role_category VARCHAR(100) NOT NULL,
      skill VARCHAR(100) NOT NULL,
      score FLOAT NOT NULL,
      rank INTEGER NOT NULL,
      computed_at TIMESTAMP DEFAULT NOW()
    );
  `)
  console.log('[Migrate] ✓ role_skill_rankings table')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS skill_trends (
      id SERIAL PRIMARY KEY,
      role_category VARCHAR(100) NOT NULL,
      skill VARCHAR(100) NOT NULL,
      job_count INTEGER NOT NULL,
      week_start DATE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(role_category, skill, week_start)
    );
  `)
  console.log('[Migrate] ✓ skill_trends table')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS gap_analysis_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      target_role VARCHAR(100) NOT NULL,
      user_skills TEXT[],
      missing_skills TEXT[],
      match_score FLOAT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)
  console.log('[Migrate] ✓ gap_analysis_history table')

  console.log('[Migrate] All migrations complete!')
  process.exit(0)
}

migrate().catch(err => {
  console.error('[Migrate] Failed:', err.message)
  process.exit(1)
})