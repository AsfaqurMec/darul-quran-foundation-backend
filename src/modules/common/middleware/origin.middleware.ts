import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error.middleware';
import { HTTP_STATUS } from '../../../constants';
import { logger } from '../utils/logger';

/**
 * Origin validation middleware
 * Only allows requests from specified origins
 */
export const originMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const allowedOrigins = [
    'https://darulquranfoundation.org',
    'https://api.darulquranfoundation.org',
    'http://localhost:3000',
    'https://localhost:3000', // Also allow https for localhost
  ];

  // Get origin from Origin header or extract from Referer header
  let origin: string | null = req.headers.origin || null;
  
  if (!origin && req.headers.referer) {
    try {
      origin = new URL(req.headers.referer).origin;
    } catch {
      logger.error('Invalid referer URL', { referer: req.headers.referer });
      origin = null;
    }
  }

  // If no origin is present, reject the request
  if (!origin) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'You are not allowed to access this resource'
    );
  }

  // Check if origin is in allowed list
  if (!allowedOrigins.includes(origin)) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'You are not allowed to access this resource'
    );
  }

  next();
};

