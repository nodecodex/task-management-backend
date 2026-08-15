import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { requestLogger } from './middleware/request-logger.middleware.js';
import { apiRateLimiter } from './middleware/rate-limit.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiRouter } from './routes/index.js';
import { setupSwagger } from './config/swagger.js';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers & CORS
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI inline scripts
    })
  );

  const allowedOrigins = env.SOCKET_CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 2. Request body parsing with size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 3. HTTP Request Logging
  app.use(requestLogger);

  // 4. Rate Limiting
  app.use(apiRateLimiter);

  // 5. Health Check Endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // 6. Swagger API Documentation
  setupSwagger(app);

  // 7. REST API v1 Routes
  app.use(env.API_PREFIX, apiRouter);

  // Root redirect to Swagger Documentation
  app.get('/', (_req, res) => {
    res.redirect('/api-docs');
  });

  // 8. 404 Not Found Middleware
  app.use(notFoundHandler);

  // 9. Centralized Error Handler Middleware
  app.use(errorHandler);

  return app;
}

export const app = createApp();
