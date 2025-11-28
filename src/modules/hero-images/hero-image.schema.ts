import { z } from 'zod';

/**
 * Zod schemas for hero image validation
 */

export const createHeroImageSchema = z.object({
  image: z.string().url('Image must be a valid URL').optional(),
  title: z
    .string()
    .max(255, 'Title must not exceed 255 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  order: z
    .coerce.number()
    .int('Order must be an integer')
    .min(0, 'Order must be a non-negative number')
    .optional()
    .default(0),
  isActive: z
    .coerce.boolean()
    .optional()
    .default(true),
});

export const updateHeroImageSchema = z.object({
  image: z.string().url('Image must be a valid URL').optional(),
  title: z
    .string()
    .max(255, 'Title must not exceed 255 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  order: z
    .coerce.number()
    .int('Order must be an integer')
    .min(0, 'Order must be a non-negative number')
    .optional(),
  isActive: z
    .coerce.boolean()
    .optional(),
});

export type CreateHeroImageInput = z.infer<typeof createHeroImageSchema>;
export type UpdateHeroImageInput = z.infer<typeof updateHeroImageSchema>;

