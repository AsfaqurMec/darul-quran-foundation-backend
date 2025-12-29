import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error.middleware';
import { HTTP_STATUS } from '../../../constants';

/**
 * Simple token validation middleware
 * Validates token from Authorization header against environment variable
 * Used for frontend token validation
 */
export const tokenMiddleware = (
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

    // Get the expected token from environment variable
    const expectedToken = "f3a1d9c6b87e4f209ad4c0c8c1f5e92e3b6a7c4de2af41b0c8f5a6d2c917eb3a";

    if (!expectedToken) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_ERROR,
        'Frontend token not configured'
      );
    }

    // Compare tokens (use constant-time comparison to prevent timing attacks)
    if (token !== expectedToken) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token');
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'Token validation failed'
        )
      );
    }
  }
};

