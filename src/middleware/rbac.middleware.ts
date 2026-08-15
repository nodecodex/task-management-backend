import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('User is not authenticated'));
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role as Role)) {
      return next(
        new ForbiddenError(
          `Access forbidden: Role '${req.user.role}' does not have sufficient permissions`
        )
      );
    }

    next();
  };
}
