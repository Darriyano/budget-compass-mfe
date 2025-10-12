import { Router } from 'express'
import { CurrencyController } from '../controllers/CurrencyController'

const router = Router()

// GET /api/currencies/rates - получить курсы валют
router.get('/rates', CurrencyController.getRates)

// GET /api/currencies/convert - конвертировать валюту
router.get('/convert', CurrencyController.convertCurrency)

export default router
