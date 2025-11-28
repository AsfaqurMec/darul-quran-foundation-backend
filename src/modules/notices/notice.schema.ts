import { z } from 'zod';

/**
 * Zod schemas for notice validation
 */

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createNoticeSchema = z.object({
  title: z
    .string()
    .min(1, 'Title must be at least 1 character')
    .max(255, 'Title must not exceed 255 characters'),
  subTitle: z
    .string()
    .min(1, 'Subtitle must be at least 1 character')
    .max(255, 'Subtitle must not exceed 255 characters'),
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must not exceed 100 characters'),
  fullContent: z.string().min(1, 'Full content is required'),
});

export const updateNoticeSchema = z.object({
  title: z
    .string()
    .min(1, 'Title must be at least 1 character')
    .max(255, 'Title must not exceed 255 characters')
    .optional(),
  subTitle: z
    .string()
    .min(1, 'Subtitle must be at least 1 character')
    .max(255, 'Subtitle must not exceed 255 characters')
    .optional(),
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must not exceed 100 characters')
    .optional(),
  fullContent: z.string().min(1, 'Full content is required').optional(),
});

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;
export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;

