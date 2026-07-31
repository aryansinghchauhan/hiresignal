import pool from '../db/connection.js'
import { processAllJobs } from '../services/nlpService.js'

// POST /api/skills/process — extracts skills from all unprocessed jobs
export async function processJobs(req, res) {
  try {
    res.json({ message: 'Skill extraction started in background' })
    processAllJobs(pool).catch(err =>
      console.error('[Skills] Background error:', err.message)
    )
  } catch (err) {
    res.status(500).json({ error: 'Failed to start processing' })
  }
}

// GET /api/skills/trending?role=backend — top skills for a role
export async function getTrendingSkills(req, res) {
  try {
    const { role, limit = 15 } = req.query

    let query = `
      SELECT js.skill, j.role_category, COUNT(*) as job_count
      FROM job_skills js
      JOIN jobs j ON js.job_id = j.id
    `
    const params = []

    if (role) {
      query += ' WHERE j.role_category = $1'
      params.push(role)
    }

    query += ` GROUP BY js.skill, j.role_category
               ORDER BY job_count DESC
               LIMIT $${params.length + 1}`
    params.push(limit)

    const result = await pool.query(query, params)
    res.json({ skills: result.rows })

  } catch (err) {
    console.error('[Skills] trending error:', err.message)
    res.status(500).json({ error: 'Failed to fetch trending skills' })
  }
}

// GET /api/skills/all-roles — top 10 skills for every role
export async function getSkillsByAllRoles(req, res) {
  try {
    const roles = ['backend', 'frontend', 'fullstack', 'ml', 'data', 'devops']
    const result = {}

    for (const role of roles) {
      const query = await pool.query(`
        SELECT js.skill, COUNT(*) as job_count
        FROM job_skills js
        JOIN jobs j ON js.job_id = j.id
        WHERE j.role_category = $1
        GROUP BY js.skill
        ORDER BY job_count DESC
        LIMIT 10
      `, [role])

      result[role] = query.rows
    }

    res.json({ roles: result })

  } catch (err) {
    console.error('[Skills] all-roles error:', err.message)
    res.status(500).json({ error: 'Failed to fetch skills by role' })
  }
}