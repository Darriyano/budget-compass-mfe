import { Router } from 'express'
import { TravelBotController } from '../controllers/TravelBotController'

const router = Router()

// POST /api/travelbot/ask - задать вопрос TravelBot
router.post('/ask', TravelBotController.askQuestion)
router.post('/rebalance', TravelBotController.rebalance)

export default router
