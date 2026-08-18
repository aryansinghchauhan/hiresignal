import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cron from 'node-cron'
import 'dotenv/config'
import authRouter from './routes/auth.js'

import jobsRouter from './routes/jobs.js'
import skillsRouter from './routes/skills.js'
import mlRouter from './routes/ml.js'
import { runScraper } from './services/scraper.js'

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, slow down.' }
})
app.use('/api', limiter)

// Routes
app.use('/api/jobs', jobsRouter)
app.use('/api/skills', skillsRouter)
app.use('/api/ml', mlRouter)
app.use('/api/auth', authRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HireSignal Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Cron job — runs scraper every Sunday at 2am automatically
cron.schedule('0 2 * * 0', () => {
  console.log('[Cron] Running weekly scrape job...')
  runScraper().catch(err => console.error('[Cron] Scrape error:', err.message))
})
console.log('[Cron] Weekly scraper scheduled for every Sunday at 2am')

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`[HireSignal] Backend running on http://localhost:${PORT}`)
  console.log(`[HireSignal] Health: http://localhost:${PORT}/health`)
})