import { z } from 'zod';

/**
 * Zod schemas for blog validation
 */

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createBlogSchema = z.object({
  title: z
    .string()
    .min(1, 'Title must be at least 1 character')
    .max(255, 'Title must not exceed 255 characters'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  thumbnail: z.string().url('Thumbnail must be a valid URL').optional(),
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .optional(),
  fullContent: z.string().min(1, 'Full content is required'),
}).superRefine((data, ctx) => {
  // Thumbnail or images can come as files, so they're optional in the schema
  // The controller will handle file validation
});

export const updateBlogSchema = z.object({
  title: z
    .string()
    .min(1, 'Title must be at least 1 character')
    .max(255, 'Title must not exceed 255 characters')
    .optional(),
  excerpt: z.string().min(1, 'Excerpt is required').optional(),
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
  thumbnail: z.string().url('Thumbnail must be a valid URL').optional(),
  // In JSON mode, client may send final keep-only list as array of URLs.
  // In multipart mode, client may omit this and instead send existingImages as stringified JSON.
  images: z
    .union([
      z.array(z.string().url('Each image must be a valid URL')),
      z.string().transform((val, ctx) => {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.every((u) => typeof u === 'string')) {
            return parsed;
          }
        } catch {
          // no-op
        }
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'images must be an array of URLs or stringified JSON array',
        });
        return z.NEVER;
      }),
    ])
    .optional(),
  // Multipart mode only
  existingImages: z
    .union([
      z.array(
        z
          .string()
          .refine(
            (val) =>
              typeof val === 'string' &&
              (val.startsWith('http://') ||
                val.startsWith('https://') ||
                val.startsWith('/')),
            'Each image must be a valid URL or start with /uploads'
          )
      ),
      z.string(),
    ])
    .optional(),
  fullContent: z.string().min(1, 'Full content is required').optional(),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;

