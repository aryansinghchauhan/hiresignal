import pool from '../db/connection.js'
import axios from 'axios'

const NLP_URL = process.env.NLP_SERVICE_URL || 'http://localhost:8000'

export async function computeTfidf(req, res) {
  try {
    const result = await pool.query(`
      SELECT j.id, j.role_category, array_agg(js.skill) as skills
      FROM jobs j
      JOIN job_skills js ON j.id = js.job_id
      GROUP BY j.id, j.role_category
    `)

    const jobs = result.rows.map(row => ({
      id: row.id,
      role_category: row.role_category,
      skills: row.skills || []
    }))

    if (jobs.length === 0) {
      return res.status(400).json({ error: 'No jobs with skills found. Run /api/skills/process first.' })
    }

    const response = await axios.post(`${NLP_URL}/tfidf-rankings`, { jobs })
    const { rankings } = response.data

    for (const [role, skillRankings] of Object.entries(rankings)) {
      for (const item of skillRankings) {
        await pool.query(`
          INSERT INTO role_skill_rankings (role_category, skill, score, rank)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
        `, [role, item.skill, item.tfidf_score, item.rank])
      }
    }

    res.json({ message: 'TF-IDF rankings computed and saved', rankings })

  } catch (err) {
    console.error('[ML] TF-IDF error:', err.message)
    res.status(500).json({ error: 'TF-IDF computation failed' })
  }
}

export async function clusterJobs(req, res) {
  try {
    const result = await pool.query(`
      SELECT j.id, j.role_category, array_agg(js.skill) as skills
      FROM jobs j
      JOIN job_skills js ON j.id = js.job_id
      GROUP BY j.id, j.role_category
    `)

    const jobs = result.rows.map(row => ({
      id: row.id,
      role_category: row.role_category,
      skills: row.skills || []
    }))

    if (jobs.length < 6) {
      return res.status(400).json({ error: 'Need at least 6 jobs with skills' })
    }

    const response = await axios.post(`${NLP_URL}/cluster-jobs`, { jobs })
    res.json(response.data)

  } catch (err) {
    console.error('[ML] Cluster error:', err.message)
    res.status(500).json({ error: 'Clustering failed' })
  }
}

export async function getRankings(req, res) {
  try {
    const { role } = req.query
    let query = `SELECT role_category, skill, score, rank FROM role_skill_rankings`
    const params = []

    if (role) {
      query += ' WHERE role_category = $1'
      params.push(role)
    }

    query += ' ORDER BY role_category, rank ASC'
    const result = await pool.query(query, params)
    res.json({ rankings: result.rows })

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rankings' })
  }
}