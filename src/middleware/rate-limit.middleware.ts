import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { ApiResponse } from '../utils/api-response.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return ApiResponse.error(
      res,
      'Too many requests, please try again later',
      ERROR_CODES.BAD_REQUEST,
      HTTP_STATUS.TOO_MANY_REQUESTS
    );
  },
  skip: () => env.NODE_ENV === 'test' || env.NODE_ENV === 'development',
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit login attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return ApiResponse.error(
      res,
      'Too many authentication attempts, please try again after 15 minutes',
      ERROR_CODES.BAD_REQUEST,
      HTTP_STATUS.TOO_MANY_REQUESTS
    );
  },
  skip: () => env.NODE_ENV === 'test' || env.NODE_ENV === 'development',
});
