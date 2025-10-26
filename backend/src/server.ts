import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { corsMiddleware } from './middleware/cors'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'

// Import routes
import cityRoutes from './routes/cityRoutes'
import tripRoutes from './routes/tripRoutes'
import currencyRoutes from './routes/currencyRoutes'
import travelBotRoutes from './routes/travelBotRoutes'
import authRoutes from './routes/authRoutes'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(morgan('combined'))
app.use(corsMiddleware)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/cities', cityRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/currencies', currencyRoutes)
app.use('/api/travelbot', travelBotRoutes)
app.use('/api/auth', authRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Budget Compass API is running',
    timestamp: new Date().toISOString(),
  })
})

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🌍 Cities API: http://localhost:${PORT}/api/cities`)
  console.log(`✈️  Trips API: http://localhost:${PORT}/api/trips`)
  console.log(`💱 Currency API: http://localhost:${PORT}/api/currencies`)
  console.log(`🤖 TravelBot API: http://localhost:${PORT}/api/travelbot`)
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`)
})

export default app
