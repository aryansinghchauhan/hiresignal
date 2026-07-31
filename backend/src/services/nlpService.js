import axios from 'axios'

const NLP_URL = process.env.NLP_SERVICE_URL || 'http://localhost:8000'

/**
 * Extracts skills from a single job description
 * by calling the Python NLP service
 */
export async function extractSkillsFromText(text, role_category) {
  try {
    const response = await axios.post(`${NLP_URL}/extract-skills`, {
      text,
      role_category
    })
    return response.data.skills || []
  } catch (err) {
    console.error('[NLP] extractSkills error:', err.message)
    return []
  }
}

/**
 * Processes all jobs in the database that don't have
 * skills extracted yet, and saves them to job_skills table
 */
export async function processAllJobs(pool) {
  console.log('[NLP] Starting batch skill extraction...')

  // Get all jobs that don't have skills extracted yet
  const jobsResult = await pool.query(`
    SELECT j.id, j.description, j.role_category
    FROM jobs j
    LEFT JOIN job_skills js ON j.id = js.job_id
    WHERE js.job_id IS NULL
  `)

  const jobs = jobsResult.rows
  console.log(`[NLP] Found ${jobs.length} unprocessed jobs`)

  let processed = 0

  for (const job of jobs) {
    try {
      // Extract skills from job description
      const skills = await extractSkillsFromText(job.description, job.role_category)

      // Save each skill to job_skills table
      for (const skill of skills) {
        await pool.query(
          `INSERT INTO job_skills (job_id, skill)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [job.id, skill]
        )
      }

      processed++
      console.log(`[NLP] ✓ Job ${job.id} — ${skills.length} skills extracted`)

    } catch (err) {
      console.error(`[NLP] Failed job ${job.id}:`, err.message)
    }
  }

  console.log(`[NLP] Batch complete — ${processed} jobs processed`)
  return processed
}