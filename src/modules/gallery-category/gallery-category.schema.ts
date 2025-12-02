import { z } from 'zod';

/**
 * Zod schemas for gallery category validation
 */

export const createGalleryCategorySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters')
    .trim(),
});

export const updateGalleryCategorySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters')
    .trim()
    .optional(),
});

export type CreateGalleryCategoryInput = z.infer<typeof createGalleryCategorySchema>;
export type UpdateGalleryCategoryInput = z.infer<typeof updateGalleryCategorySchema>;

