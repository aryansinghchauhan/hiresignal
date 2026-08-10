import express from 'express'
import { computeTfidf, clusterJobs, getRankings } from '../controllers/mlController.js'

const router = express.Router()

router.post('/tfidf', computeTfidf)
router.post('/cluster', clusterJobs)
router.get('/rankings', getRankings)

export default router