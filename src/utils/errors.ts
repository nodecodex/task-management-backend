import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details: unknown[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode: string = ERROR_CODES.INTERNAL_SERVER_ERROR,
    details: unknown[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', errorCode: string = ERROR_CODES.NOT_FOUND) {
    super(message, HTTP_STATUS.NOT_FOUND, errorCode);
  }
}

export class BadRequestError extends AppError {
  constructor(
    message: string = 'Bad request',
    errorCode: string = ERROR_CODES.BAD_REQUEST,
    details: unknown[] = []
  ) {
    super(message, HTTP_STATUS.BAD_REQUEST, errorCode, details);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    details: unknown[] = [],
    errorCode: string = ERROR_CODES.VALIDATION_ERROR
  ) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errorCode, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message: string = 'Unauthorized access',
    errorCode: string = ERROR_CODES.UNAUTHORIZED
  ) {
    super(message, HTTP_STATUS.UNAUTHORIZED, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message: string = 'Forbidden - Insufficient permissions',
    errorCode: string = ERROR_CODES.FORBIDDEN
  ) {
    super(message, HTTP_STATUS.FORBIDDEN, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string = 'Resource conflict',
    errorCode: string = ERROR_CODES.CONFLICT
  ) {
    super(message, HTTP_STATUS.CONFLICT, errorCode);
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string = 'Database operation failed',
    errorCode: string = ERROR_CODES.DATABASE_ERROR,
    details: unknown[] = []
  ) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode, details);
  }
}
