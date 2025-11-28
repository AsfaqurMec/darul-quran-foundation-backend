import { z } from 'zod';

/**
 * Zod schemas for activity validation
 */

export const createActivitySchema = z.object({
  title: z
    .string()
    .min(1, 'Title must be at least 1 character')
    .max(255, 'Title must not exceed 255 characters'),
  tag: z
    .string()
    .min(1, 'Tag is required')
    .max(100, 'Tag must not exceed 100 characters'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url('Image must be a valid URL'),
  thumbnail: z.string().url('Thumbnail must be a valid URL'),
});

export const updateActivitySchema = z.object({
  title: z
    .string()
    .min(1, 'Title must be at least 1 character')
    .max(255, 'Title must not exceed 255 characters')
    .optional(),
  tag: z
    .string()
    .min(1, 'Tag is required')
    .max(100, 'Tag must not exceed 100 characters')
    .optional(),
  description: z.string().min(1, 'Description is required').optional(),
  image: z.string().url('Image must be a valid URL').optional(),
  thumbnail: z.string().url('Thumbnail must be a valid URL').optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

