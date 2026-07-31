import express from 'express'
import { getJobs, getJobCounts, seedJobs, scrapeJobs } from '../controllers/jobsController.js'

const router = express.Router()

router.get('/', getJobs)
router.get('/count', getJobCounts)
router.post('/seed', seedJobs)
router.post('/scrape', scrapeJobs)

export default router