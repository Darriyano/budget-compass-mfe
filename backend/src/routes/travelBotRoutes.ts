import { Router } from 'express'
import { TravelBotController } from '../controllers/TravelBotController'

const router = Router()

// POST /api/travelbot/ask - задать вопрос TravelBot
router.post('/ask', TravelBotController.askQuestion)

export default router
