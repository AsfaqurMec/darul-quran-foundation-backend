import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/modules/common/utils/jwt';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';

/**
 * Authentication middleware
 * Verifies JWT access token from Authorization header
 * Attaches user payload to req.user for downstream routes
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    // Accept either a raw token (frontend sends raw token) or standard Bearer token
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader || '';

    if (!token) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authorization token required');
    }

    const payload = verifyAccessToken(token);

    // Attach user to request object
    req.user = {
      id: payload.id,
      identifier: payload.identifier,
      email: payload.email ?? undefined,
      phone: payload.phone ?? undefined,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'Invalid or expired token'
        )
      );
    }
  }
};

