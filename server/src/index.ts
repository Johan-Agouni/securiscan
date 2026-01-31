import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { startScanWorker } from './modules/scanner/scanner.worker';
import { restoreAllSchedules } from './modules/scanner/scheduler.service';

async function bootstrap() {
  const app = createApp();

  // Verify database connection
  await prisma.$connect();
  logger.info('Database connected');

  // Start BullMQ scan worker
  startScanWorker();
  logger.info('Scan worker started');

  // Restore scheduled scans from database
  await restoreAllSchedules();

  const server = app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT} [${config.NODE_ENV}]`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      await redis.quit();
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
