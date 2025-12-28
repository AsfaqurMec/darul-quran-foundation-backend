import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error.middleware';
import { HTTP_STATUS } from '../../../constants';
import { logger } from '../utils/logger';
import { config } from '../../../config';

/**
 * Origin validation middleware
 * Only allows requests from specified origins
 * Uses CORS_ORIGIN from config, with fallback to hardcoded origins
 */
export const originMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get allowed origins from config (supports '*' for development)
  const configOrigins = config.cors.origin;
  
  // Fallback hardcoded origins if config doesn't have specific ones
  const hardcodedOrigins = [
    'https://darulquranfoundation.org',
    'https://api.darulquranfoundation.org',
    'http://localhost:3000',
    'https://localhost:3000',
  ];

  // Combine config origins with hardcoded ones, remove duplicates
  const allowedOrigins = [
    ...new Set([...configOrigins, ...hardcodedOrigins])
  ];

  // If '*' is in allowed origins, allow all requests (development mode)
  if (allowedOrigins.includes('*')) {
    return next();
  }

  // Get origin from Origin header or extract from Referer header
  let origin: string | null = req.headers.origin || null;
  
  if (!origin && req.headers.referer) {
    try {
      origin = new URL(req.headers.referer).origin;
    } catch (error) {
      logger.warn('Invalid referer URL', { 
        referer: req.headers.referer,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      origin = null;
    }
  }

  // If no origin is present, reject the request
  if (!origin) {
    logger.warn('Request rejected: No origin header', {
      path: req.path,
      method: req.method,
      referer: req.headers.referer,
    });
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'You are not allowed to access this resource. Origin header is required.'
    );
  }

  // Check if origin is in allowed list
  if (!allowedOrigins.includes(origin)) {
    logger.warn('Request rejected: Origin not allowed', {
      path: req.path,
      method: req.method,
      origin,
      allowedOrigins,
    });
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      `You are not allowed to access this resource. Origin '${origin}' is not in the allowed list.`
    );
  }

  next();
};

