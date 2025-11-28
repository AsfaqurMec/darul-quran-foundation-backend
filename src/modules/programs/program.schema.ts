import { z } from 'zod';

/**
 * Zod schemas for program validation
 */

/**
 * Generate URL-friendly slug from string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Custom Zod schema for URLs or relative paths
 * Accepts both full URLs (http://, https://) and relative paths (starting with /)
 */
const urlOrPathSchema = z.string().refine(
  (val) => {
    // Accept full URLs
    if (val.startsWith('http://') || val.startsWith('https://')) {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }
    // Accept relative paths starting with /
    if (val.startsWith('/')) {
      return true;
    }
    return false;
  },
  {
    message: 'Must be a valid URL (http:// or https://) or a relative path (starting with /)',
  }
);

export const createProgramSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters'),
  subtitle: z
    .string()
    .min(1, 'Subtitle is required')
    .max(255, 'Subtitle must not exceed 255 characters'),
  thumbnail: urlOrPathSchema.optional(),
  video: z.string().url('Video must be a valid URL'),
  description: z.string().min(1, 'Description is required'),
  media: z
    .array(urlOrPathSchema)
    .optional(),
  slug: z
    .string()
    .max(255, 'Slug must not exceed 255 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase, hyphens only)')
    .optional(),
  area: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  beneficiary: z.array(z.string()).optional().default([]),
  expenseCategory: z.array(z.string()).optional().default([]),
  projectGoalsAndObjectives: z.array(z.string()).optional().default([]),
  activities: z.array(z.string()).optional().default([]),
});

export const updateProgramSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters')
    .optional(),
  subtitle: z
    .string()
    .min(1, 'Subtitle is required')
    .max(255, 'Subtitle must not exceed 255 characters')
    .optional(),
  thumbnail: urlOrPathSchema.optional(),
  video: z.string().url('Video must be a valid URL').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  media: z
    .array(urlOrPathSchema)
    .optional(),
  // Multipart mode only: allows client to pass keep-list similar to blog.existingImages
  existingMedia: z
    .union([
      z.array(urlOrPathSchema),
      z.string(),
    ])
    .optional(),
  slug: z
    .string()
    .max(255, 'Slug must not exceed 255 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase, hyphens only)')
    .optional(),
  area: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  beneficiary: z.array(z.string()).optional(),
  expenseCategory: z.array(z.string()).optional(),
  projectGoalsAndObjectives: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

