import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';
import { authRoutes } from './modules/auth/auth.routes';
import { sitesRoutes } from './modules/sites/sites.routes';
import { scansRoutes } from './modules/scans/scans.routes';
import { paymentsRoutes } from './modules/payments/payments.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { apiResponse } from './utils/apiResponse';

export function createApp() {
  const app = express();

  // Trust proxy must be set before any middleware that reads headers
  if (config.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // CORS (must be before HTTPS redirect and helmet for preflight requests)
  app.use(
    cors({
      origin: config.FRONTEND_URL,
      credentials: true,
    })
  );

  // HTTPS redirect in production (after CORS so preflight OPTIONS work)
  if (config.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", config.FRONTEND_URL],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );
  app.use(hpp());

  // Rate limiting
  app.use(globalLimiter);

  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    apiResponse({
      res,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/sites', sitesRoutes);
  app.use('/api/scans', scansRoutes);
  app.use('/api/payments', paymentsRoutes);
  app.use('/api/admin', adminRoutes);

  // 404
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}
