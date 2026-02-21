import cors from 'cors';
import { config } from './env';

// Parse multiple origins from environment variable
const allowedOrigins = config.CORS_ORIGIN 
  ? config.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow the configured origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours
};

export default cors(corsOptions);
