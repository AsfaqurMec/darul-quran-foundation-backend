import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';

/**
 * Request validation middleware using Zod
 * Validates request body, query, or params based on schema
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        next(
          new ApiError(HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors)
        );
      } else {
        next(error);
      }
    }
  };
};

