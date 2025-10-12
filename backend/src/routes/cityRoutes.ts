import { Router } from 'express'
import { CityController } from '../controllers/CityController'

const router = Router()

// GET /api/cities - получить все города
router.get('/', CityController.getAllCities)

// GET /api/cities/search - поиск городов по параметрам
router.get('/search', CityController.searchCities)

// GET /api/cities/:id - получить город по ID
router.get('/:id', CityController.getCityById)

export default router
