import { Request, Response } from 'express';
import { ApiResponse } from '../utils/api-response.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';

export function notFoundHandler(req: Request, res: Response): Response {
  return ApiResponse.error(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    ERROR_CODES.NOT_FOUND,
    HTTP_STATUS.NOT_FOUND
  );
}
