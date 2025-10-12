import { Router } from 'express'
import { TripController } from '../controllers/TripController'

const router = Router()

// GET /api/trips - получить все сохраненные поездки
router.get('/', TripController.getAllTrips)

// GET /api/trips/:id - получить поездку по ID
router.get('/:id', TripController.getTripById)

// POST /api/trips - сохранить новую поездку
router.post('/', TripController.saveTrip)

// DELETE /api/trips/:id - удалить поездку
router.delete('/:id', TripController.deleteTrip)

export default router
