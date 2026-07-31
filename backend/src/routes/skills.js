import express from 'express'
import { processJobs, getTrendingSkills, getSkillsByAllRoles } from '../controllers/skillsController.js'

const router = express.Router()

router.post('/process', processJobs)
router.get('/trending', getTrendingSkills)
router.get('/all-roles', getSkillsByAllRoles)

export default router