import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import fs from 'fs'
import { corsMiddleware } from './middleware/cors'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import cityRoutes from './routes/cityRoutes'
import tripRoutes from './routes/tripRoutes'
import currencyRoutes from './routes/currencyRoutes'
import travelBotRoutes from './routes/travelBotRoutes'
import authRoutes from './routes/authRoutes'

const app = express()
const PORT = process.env.PORT || 5000

app.use((req, res, next) => {
  const origin = req.headers.origin
  const allowedOriginsList = [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
  ]
  
  if (origin && allowedOriginsList.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Credentials', 'true')
  }
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request received from:', origin)
    if (origin && allowedOriginsList.includes(origin)) {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
      res.header('Access-Control-Max-Age', '86400')
      console.log('OPTIONS response sent with CORS headers')
      return res.sendStatus(204)
    } else {
      console.log('OPTIONS request from blocked origin:', origin)
      return res.sendStatus(403)
    }
  }
  next()
})

app.use(corsMiddleware)
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/cities', cityRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/currencies', currencyRoutes)
app.use('/api/travelbot', travelBotRoutes)
app.use('/api/auth', authRoutes)

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Budget Compass API is running',
    timestamp: new Date().toISOString(),
  })
})

// Serve static files from React app
const frontendBuildPath = path.join(__dirname, '../../frontend/build')
const basePath = process.env.BASE_PATH || ''

// Check if frontend build exists
const frontendExists = fs.existsSync(frontendBuildPath)

if (frontendExists) {
  // Serve static files with base path if configured
  if (basePath) {
    app.use(basePath, express.static(frontendBuildPath))
    
    // Fallback to index.html for client-side routing (SPA) with base path
    app.get('*', (req, res, next) => {
      // Only serve index.html for non-API routes that match base path
      if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
        if (req.path.startsWith(basePath) || req.path === basePath || req.path === basePath + '/') {
          res.sendFile(path.join(frontendBuildPath, 'index.html'))
        } else {
          next()
        }
      } else {
        next()
      }
    })
  } else {
    app.use(express.static(frontendBuildPath))
    
    // Fallback to index.html for client-side routing (SPA)
    app.get('*', (req, res, next) => {
      // Only serve index.html for non-API routes
      if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
        res.sendFile(path.join(frontendBuildPath, 'index.html'))
      } else {
        next()
      }
    })
  }
} else {
  console.warn('⚠️  Frontend build directory not found. Static files will not be served.')
  console.warn(`   Expected path: ${frontendBuildPath}`)
}

app.use(notFoundHandler)
app.use(errorHandler)

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
