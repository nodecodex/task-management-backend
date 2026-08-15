import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors.js';
import { ApiResponse } from '../utils/api-response.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response | void {
  // 1. Log the error
  logger.error(
    {
      err: {
        name: err.name,
        message: err.message,
        stack: env.NODE_ENV === 'development' ? err.stack : undefined,
      },
      path: req.path,
      method: req.method,
      ip: req.ip,
      body: req.body,
    },
    'Request error caught by global handler'
  );

  // 2. Handle AppError (custom domain exceptions)
  if (err instanceof AppError) {
    return ApiResponse.error(
      res,
      err.message,
      err.errorCode,
      err.statusCode,
      err.details
    );
  }

  // 3. Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedDetails = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));

    return ApiResponse.error(
      res,
      'Validation failed',
      ERROR_CODES.VALIDATION_ERROR,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      formattedDetails
    );
  }

  // 4. Handle Prisma database errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return ApiResponse.error(
        res,
        `A record with this ${target} already exists`,
        ERROR_CODES.CONFLICT,
        HTTP_STATUS.CONFLICT,
        [{ target }]
      );
    }

    if (err.code === 'P2025') {
      return ApiResponse.error(
        res,
        'Resource not found in database',
        ERROR_CODES.NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (err.code === 'P2003') {
      return ApiResponse.error(
        res,
        'Related foreign key record not found',
        ERROR_CODES.BAD_REQUEST,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return ApiResponse.error(
      res,
      'Database query execution error',
      ERROR_CODES.DATABASE_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  // 5. Handle JSON body parse errors
  if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400) {
    return ApiResponse.error(
      res,
      'Malformed JSON payload in request body',
      ERROR_CODES.BAD_REQUEST,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 6. Handle unexpected / unhandled 500 errors
  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred'
      : err.message || 'Internal server error';

  return ApiResponse.error(
    res,
    message,
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}
