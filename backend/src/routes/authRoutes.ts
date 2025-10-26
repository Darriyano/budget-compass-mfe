import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Регистрация
router.post('/register', AuthController.register)

// Вход
router.post('/login', AuthController.login)

// Получение профиля (требует авторизации)
router.get('/profile', authenticateToken, AuthController.getProfile)

export default router
