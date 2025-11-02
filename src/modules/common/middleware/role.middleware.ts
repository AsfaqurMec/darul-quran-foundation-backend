import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';
import { Role } from '@/constants';

/**
 * Role-based access control (RBAC) middleware
 * Checks if authenticated user has required role(s)
 * Must be used after authMiddleware
 */
export const roleMiddleware = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'Authentication required'
      );
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Insufficient permissions'
      );
    }

    next();
  };
};

