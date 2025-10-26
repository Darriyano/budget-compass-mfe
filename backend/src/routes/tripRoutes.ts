import { Router } from 'express'
import { TripController } from '../controllers/TripController'
import { optionalAuth } from '../middleware/auth'

const router = Router()

// GET /api/trips - получить все сохраненные поездки (опциональная авторизация)
router.get('/', optionalAuth, TripController.getAllTrips)

// GET /api/trips/:id - получить поездку по ID (опциональная авторизация)
router.get('/:id', optionalAuth, TripController.getTripById)

// POST /api/trips - сохранить новую поездку (опциональная авторизация)
router.post('/', optionalAuth, TripController.saveTrip)

// DELETE /api/trips/:id - удалить поездку (опциональная авторизация)
router.delete('/:id', optionalAuth, TripController.deleteTrip)

export default router
