import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import routes from './routes';
import { specs } from './config/swagger';
import { xssProtection, mongoSanitize } from './middleware/security';
import { logKcdApiCall } from './middleware/authKcd';

const app: Application = express();

// Security middleware
app.use(helmet());

// Input sanitization middleware
app.use(xssProtection);
app.use(mongoSanitize);

// CORS configuration
import { corsOptions } from './config/cors';

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply only to API, not auth
app.use('/api/warehouse', limiter);
app.use('/api/admin', limiter);
app.use('/api/customer', limiter);

// Use stricter limiter for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging for security
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userId: (req as any).user?._id,
    auth: req.headers.authorization ? 'JWT' : (req.headers['x-api-key'] ? 'API_KEY' : 'NONE'),
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  try {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      vercel: process.env.VERCEL === '1'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API health check endpoint (alternative)
app.get('/api/health', (req: Request, res: Response) => {
  try {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      vercel: process.env.VERCEL === '1'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Swagger JSON spec endpoint
app.get('/api-docs', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(specs);
});

// Swagger UI endpoint
app.use('/docs', swaggerUi.serve);
app.get('/docs', swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Warehouse Management API Documentation'
}));

// Redirect root to docs
app.get('/', (req: Request, res: Response) => {
  res.redirect('/docs');
});

// API routes
app.use('/api', routes);

// Middleware: KCD logging (must be before KCD routes)
app.use('/api/kcd', logKcdApiCall);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      documentation: '/docs',
      health: '/health',
      api: '/api'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;