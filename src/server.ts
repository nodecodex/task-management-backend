import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { initSocketServer } from './config/socket.js';
import { logger } from './utils/logger.js';

async function startServer(): Promise<void> {
  try {
    // 1. Connect to PostgreSQL
    await connectDatabase();

    // 2. Create HTTP Server & initialize Socket.IO
    const httpServer = createServer(app);
    initSocketServer(httpServer);

    // 3. Start listening on configured port
    const server = httpServer.listen(env.PORT, () => {
      logger.info(`🚀 Kanban Backend API running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`📌 API Base URL: http://localhost:${env.PORT}${env.API_PREFIX}`);
      logger.info(`📖 Swagger Docs: http://localhost:${env.PORT}/api-docs`);
      logger.info(`⚡ Socket.IO Server initialized`);
    });

    // 4. Handle Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force shutdown if taking longer than 10s
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.fatal({ error }, 'Fatal error during server startup');
    process.exit(1);
  }
}

startServer();
