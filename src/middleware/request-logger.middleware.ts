import pinoHttp from 'pino-http';
import { logger } from '../utils/logger.js';

export const requestLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} -> ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} -> ${res.statusCode} (${err.message})`;
  },
  autoLogging: {
    ignore: (req) => {
      // Ignore health check and swagger asset requests from spamming logs
      return (
        req.url === '/health' ||
        (typeof req.url === 'string' && req.url.startsWith('/api-docs'))
      );
    },
  },
});
