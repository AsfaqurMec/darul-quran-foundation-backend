import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';
import { config } from '@/config';

/**
 * Request validation middleware using Zod
 * Validates request body, query, or params based on schema
 * Handles multipart/form-data by cleaning empty strings and parsing arrays
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // For query or params, validate and update with transformed values
      if (source === 'query') {
        const parsed = schema.parse(req.query);
        req.query = parsed as any;
        next();
        return;
      }
      
      if (source === 'params') {
        const parsed = schema.parse(req.params);
        req.params = parsed as any;
        next();
        return;
      }

      // Clean up req.body for multipart/form-data
      // Convert empty strings to undefined and handle string arrays
      const cleanedBody = { ...req.body };
      
      // If files were uploaded, remove media/thumbnail/images from body (controller will use files)
      // This prevents validation errors when existing relative paths are sent
      if (req.file) {
        delete cleanedBody.media;
        delete cleanedBody.thumbnail;
      }
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
        if (Array.isArray(files)) {
          // Multiple files uploaded as array
          delete cleanedBody.images;
        } else {
          // Files uploaded as object with field names
          if (files.thumbnail) delete cleanedBody.thumbnail;
          if (files.images) delete cleanedBody.images;
          if (files.media) delete cleanedBody.media;
        }
      }
      
      for (const key in cleanedBody) {
        const value = cleanedBody[key];
        
        // Convert empty strings, null, or undefined to be removed (so optional fields work correctly)
        if (value === '' || value === null || value === undefined) {
          delete cleanedBody[key];
          continue;
        }

        // If thumbnail/images/media arrive as non-strings (e.g., file objects in body), remove them.
        // Files are handled separately via req.files in controllers.
        if (key === 'thumbnail' || key === 'images' || key === 'media') {
          if (typeof value !== 'string') {
            if (Array.isArray(value)) {
              const allStrings = value.every((item) => typeof item === 'string');
              if (!allStrings) {
                delete cleanedBody[key];
                continue;
              }
            } else {
              delete cleanedBody[key];
              continue;
            }
          }
        }
        
        // Handle media/thumbnail fields: convert relative paths to full URLs
        if (typeof value === 'string' && (key === 'media' || key === 'thumbnail')) {
          // If it's already a full URL, keep it
          if (value.startsWith('http://') || value.startsWith('https://')) {
            continue;
          }
          // If it's a relative path (starts with /), convert to full URL
          if (value.startsWith('/')) {
            const backendUrl = config.upload.backendUrl?.replace(/\/$/, '') || '';
            if (backendUrl) {
              cleanedBody[key] = `${backendUrl}${value}`;
            }
          }
        }
        
        // Handle arrays that are already parsed (not JSON strings)
        if (Array.isArray(value)) {
          if (key === 'images' || key === 'media') {
            // Convert relative paths in array to full URLs
            cleanedBody[key] = value.map((item: string) => {
              if (typeof item === 'string') {
                if (item.startsWith('http://') || item.startsWith('https://')) {
                  return item;
                }
                if (item.startsWith('/')) {
                  const backendUrl = config.upload.backendUrl?.replace(/\/$/, '') || '';
                  return backendUrl ? `${backendUrl}${item}` : item;
                }
              }
              return item;
            });
            continue; // Skip further processing for this key
          } else if (key === 'daily' || key === 'monthly' || key === 'amount') {
            // Convert number arrays - ensure all items are numbers
            cleanedBody[key] = value.map((item: any) => {
              const num = Number(item);
              return isNaN(num) ? item : num;
            });
            continue; // Skip further processing for this key
          }
        }
        
        // Handle string arrays (form data sometimes sends arrays as JSON strings)
        // Check if the value looks like a JSON array string
        if (typeof value === 'string' && (value.trim().startsWith('[') || key === 'images' || key === 'media' || key === 'beneficiary' || key === 'expenseCategory' || key === 'projectGoalsAndObjectives' || key === 'activities' || key === 'daily' || key === 'monthly' || key === 'amount')) {
          try {
            // Try to parse as JSON array
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              // For image/media fields, convert relative paths to full URLs
              if (key === 'images' || key === 'media') {
                cleanedBody[key] = parsed.map((item: string) => {
                  if (typeof item === 'string') {
                    if (item.startsWith('http://') || item.startsWith('https://')) {
                      return item;
                    }
                    if (item.startsWith('/')) {
                      const backendUrl = config.upload.backendUrl?.replace(/\/$/, '') || '';
                      return backendUrl ? `${backendUrl}${item}` : item;
                    }
                  }
                  return item;
                });
              } else if (key === 'daily' || key === 'monthly' || key === 'amount') {
                // For number arrays, convert to numbers
                cleanedBody[key] = parsed.map((item: any) => {
                  const num = Number(item);
                  return isNaN(num) ? item : num;
                });
                // Keep empty arrays as null for these fields
                if (cleanedBody[key].length === 0) {
                  cleanedBody[key] = null;
                }
              } else {
                // For other array fields, just use the parsed array
                cleanedBody[key] = parsed;
              }
              
              // Remove if empty array (unless it's explicitly allowed)
              if (cleanedBody[key] !== null && cleanedBody[key].length === 0 && key !== 'beneficiary' && key !== 'expenseCategory' && key !== 'projectGoalsAndObjectives' && key !== 'activities' && key !== 'daily' && key !== 'monthly' && key !== 'amount') {
                delete cleanedBody[key];
              }
            } else {
              if (key === 'amount') {
                cleanedBody[key] = value;
              } else {
                delete cleanedBody[key];
              }
            }
          } catch {
            // If not JSON, treat as comma-separated string (for non-array fields, skip)
            if (key === 'images' || key === 'media' || key === 'beneficiary' || key === 'expenseCategory' || key === 'projectGoalsAndObjectives' || key === 'activities' || key === 'daily' || key === 'monthly' || key === 'amount') {
              const trimmed = value.trim();
              if (trimmed !== '' && trimmed !== '[]') {
                const array = trimmed.split(',').map((s: string) => {
                  const trimmedItem = s.trim();
                  // Convert relative paths to full URLs for image fields
                  if ((key === 'images' || key === 'media') && trimmedItem.startsWith('/')) {
                    const backendUrl = config.upload.backendUrl?.replace(/\/$/, '') || '';
                    return backendUrl ? `${backendUrl}${trimmedItem}` : trimmedItem;
                  }
                  // Convert to numbers for amount fields
                  if (key === 'daily' || key === 'monthly' || key === 'amount') {
                    const num = Number(trimmedItem);
                    return isNaN(num) ? trimmedItem : num;
                  }
                  return trimmedItem;
                }).filter((s: any) => s !== '');
                if (key === 'daily' || key === 'monthly' || key === 'amount') {
                  cleanedBody[key] = array.length > 0 ? array : null;
                } else {
                  cleanedBody[key] = array.length > 0 ? array : (key === 'beneficiary' || key === 'expenseCategory' || key === 'projectGoalsAndObjectives' || key === 'activities' ? [] : undefined);
                }
                if (cleanedBody[key] === undefined) {
                  delete cleanedBody[key];
                }
              } else if (trimmed === '[]') {
                if (key === 'daily' || key === 'monthly' || key === 'amount') {
                  cleanedBody[key] = null;
                } else if (key === 'beneficiary' || key === 'expenseCategory' || key === 'projectGoalsAndObjectives' || key === 'activities') {
                  cleanedBody[key] = [];
                }
              } else {
                delete cleanedBody[key];
              }
            }
          }
        }
      }
      
      const parsedBody = schema.parse(cleanedBody);
      // Replace req.body with parsed/transformed version
      req.body = parsedBody;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          received: err.code === 'invalid_type' ? err.received : undefined,
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

