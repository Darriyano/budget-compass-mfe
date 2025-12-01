import cors from 'cors'

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

export const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true)
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false,
}

export const corsMiddleware = cors(corsOptions)
