import pool from '../db/connection.js'
import axios from 'axios'
import FormData from 'form-data'

const NLP_URL = process.env.NLP_SERVICE_URL || 'http://localhost:8000'

export async function analyzeGap(req, res) {
  try {
    const { target_role } = req.body
    const userId = req.userId

    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' })
    }

    if (!target_role) {
      return res.status(400).json({ error: 'target_role is required' })
    }

    const validRoles = ['backend', 'frontend', 'fullstack', 'ml', 'data', 'devops']
    if (!validRoles.includes(target_role)) {
      return res.status(400).json({ error: `target_role must be one of: ${validRoles.join(', ')}` })
    }

    // Send PDF to Python NLP service for skill extraction
    const formData = new FormData()
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: 'application/pdf'
    })

    const nlpResponse = await axios.post(`${NLP_URL}/extract-resume`, formData, {
      headers: formData.getHeaders()
    })

    const userSkills = nlpResponse.data.skills || []

    if (userSkills.length === 0) {
      return res.status(400).json({ error: 'Could not extract any skills from your resume. Make sure it is a text-based PDF.' })
    }

    // Get top skills for the target role from our database
    const roleSkillsResult = await pool.query(`
      SELECT js.skill, COUNT(*) as job_count
      FROM job_skills js
      JOIN jobs j ON js.job_id = j.id
      WHERE j.role_category = $1
      GROUP BY js.skill
      ORDER BY job_count DESC
      LIMIT 20
    `, [target_role])

    const roleSkills = roleSkillsResult.rows.map(row => row.skill.toLowerCase())
    const userSkillsLower = userSkills.map(s => s.toLowerCase())

    // Compute match score
    const matchingSkills = roleSkills.filter(skill => userSkillsLower.includes(skill))
    const missingSkills = roleSkills.filter(skill => !userSkillsLower.includes(skill))
    const matchScore = Math.round((matchingSkills.length / roleSkills.length) * 100)

    // Save to history if user is logged in
    if (userId) {
      await pool.query(`
        INSERT INTO gap_analysis_history (user_id, target_role, user_skills, missing_skills, match_score)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, target_role, userSkills, missingSkills, matchScore])
    }

    res.json({
      target_role,
      match_score: matchScore,
      user_skills: userSkills,
      matching_skills: matchingSkills,
      missing_skills: missingSkills,
      total_role_skills: roleSkills.length,
      summary: `You match ${matchScore}% of top ${target_role} skills. Add ${missingSkills.slice(0, 3).join(', ')} to improve your profile.`
    })

  } catch (err) {
    console.error('[Gap] analyzeGap error:', err.message)
    res.status(500).json({ error: 'Gap analysis failed: ' + err.message })
  }
}

export async function getHistory(req, res) {
  try {
    const result = await pool.query(`
      SELECT id, target_role, user_skills, missing_skills, match_score, created_at
      FROM gap_analysis_history
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `, [req.userId])

    res.json({ history: result.rows })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' })
  }
}