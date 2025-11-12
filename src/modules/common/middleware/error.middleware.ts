import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { config } from '@/config';
import { HTTP_STATUS } from '@/constants';
import { logger } from '@/modules/common/utils/logger';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Central error handling middleware
 * Handles all errors and sends structured JSON response
 */
export const errorMiddleware = (
  err: Error | ApiError | ZodError | mongoose.Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known error types
  if (err instanceof ApiError) {
    const payload: Record<string, unknown> = {
      status: 'error',
      message: err.message,
    };
    if (typeof err.details !== 'undefined') {
      payload.details = err.details;
    }
    res.status(err.statusCode).json(payload);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: 'error',
      message: 'Validation failed',
      details: errors,
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      path: e.path,
      message: e.message,
    }));

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: 'error',
      message: 'Validation failed',
      details: errors,
    });
    return;
  }

  // Handle Mongoose duplicate key errors
  if (err instanceof mongoose.Error && (err as any).code === 11000) {
    res.status(HTTP_STATUS.CONFLICT).json({
      status: 'error',
      message: 'Duplicate entry',
      details: 'A record with this value already exists',
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
    return;
  }

  // Default: Internal server error
  const defaultPayload: Record<string, unknown> = {
    status: 'error',
    message:
      config.nodeEnv === 'production'
        ? 'Internal server error'
        : err.message,
  };
  if (config.nodeEnv === 'development') {
    defaultPayload.stack = err.stack;
  }
  res.status(HTTP_STATUS.INTERNAL_ERROR).json(defaultPayload);
};

