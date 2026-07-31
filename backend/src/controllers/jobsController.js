import pool from '../db/connection.js'
import { seedDatabase } from '../services/seedJobs.js'
import { runScraper } from '../services/scraper.js'

// GET /api/jobs — returns all jobs with optional role filter
export async function getJobs(req, res) {
  try {
    const { role, limit = 20, offset = 0 } = req.query

    let query = 'SELECT id, title, company, role_category, url, scraped_at FROM jobs'
    const params = []

    if (role) {
      query += ' WHERE role_category = $1'
      params.push(role)
    }

    query += ` ORDER BY scraped_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)
    res.json({ total: result.rowCount, jobs: result.rows })

  } catch (err) {
    console.error('[Jobs] getJobs error:', err.message)
    res.status(500).json({ error: 'Failed to fetch jobs' })
  }
}

// GET /api/jobs/count — returns job count per role
export async function getJobCounts(req, res) {
  try {
    const result = await pool.query(`
      SELECT role_category, COUNT(*) as count
      FROM jobs
      GROUP BY role_category
      ORDER BY count DESC
    `)
    res.json({ counts: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch counts' })
  }
}

// POST /api/jobs/seed — seeds the database with 50 hardcoded jobs
export async function seedJobs(req, res) {
  try {
    const result = await seedDatabase()
    res.json({ message: 'Database seeded successfully', ...result })
  } catch (err) {
    console.error('[Jobs] seed error:', err.message)
    res.status(500).json({ error: 'Seed failed' })
  }
}

// POST /api/jobs/scrape — triggers a manual scrape
export async function scrapeJobs(req, res) {
  try {
    res.json({ message: 'Scrape job started in background' })
    // Run scraper after sending response so client doesn't wait
    runScraper().catch(err => console.error('[Scraper] Background error:', err.message))
  } catch (err) {
    res.status(500).json({ error: 'Scrape failed to start' })
  }
}