import { z } from 'zod';

/**
 * Zod schemas for gallery validation
 */

export const createGalleryItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters'),
  media: z.string().url('Media must be a valid URL').optional(),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must not exceed 100 characters'),
  type: z.enum(['image', 'video'], {
    errorMap: () => ({ message: 'Type must be either "image" or "video"' }),
  }),
}).superRefine((data, ctx) => {
  if (data.type === 'video' && !data.media) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Media URL is required for video items',
      path: ['media'],
    });
  }
});

export const updateGalleryItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters')
    .optional(),
  media: z.string().url('Media must be a valid URL').optional(),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must not exceed 100 characters')
    .optional(),
  type: z
    .enum(['image', 'video'], {
      errorMap: () => ({ message: 'Type must be either "image" or "video"' }),
    })
    .optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'video' && data.media === undefined) {
    // allow updates that don't change media
    return;
  }
  if (data.type === 'video' && data.media === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Media URL is required for video items',
      path: ['media'],
    });
  }
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;
export type UpdateGalleryItemInput = z.infer<typeof updateGalleryItemSchema>;

