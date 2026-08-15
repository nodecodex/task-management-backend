import { Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';
import { ApiResponseData, PaginationMeta } from '../types/common.types.js';

export class ApiResponse {
  public static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = HTTP_STATUS.OK,
    meta?: Record<string, unknown>
  ): Response {
    const payload: ApiResponseData<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
      ...(meta !== undefined && { meta }),
    };

    return res.status(statusCode).json(payload);
  }

  public static created<T>(res: Response, message: string, data?: T): Response {
    return ApiResponse.success(res, message, data, HTTP_STATUS.CREATED);
  }

  public static noContent(res: Response): Response {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  public static paginated<T>(
    res: Response,
    message: string,
    data: T[],
    meta: PaginationMeta,
    statusCode: number = HTTP_STATUS.OK
  ): Response {
    const payload: ApiResponseData<T[]> = {
      success: true,
      message,
      data,
      meta,
    };

    return res.status(statusCode).json(payload);
  }

  public static error(
    res: Response,
    message: string,
    errorCode: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details: unknown[] = []
  ): Response {
    const payload: ApiResponseData = {
      success: false,
      message,
      error: {
        code: errorCode,
        ...(details.length > 0 && { details }),
      },
    };

    return res.status(statusCode).json(payload);
  }
}
