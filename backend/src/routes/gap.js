import express from 'express'
import multer from 'multer'
import { analyzeGap, getHistory } from '../controllers/gapController.js'
import { authenticate } from '../middleware/authenticate.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files allowed'))
    }
  }
})

router.post('/analyze', authenticate, upload.single('resume'), analyzeGap)
router.get('/history', authenticate, getHistory)

export default router