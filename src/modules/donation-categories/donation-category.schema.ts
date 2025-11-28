import { z } from 'zod';

/**
 * Zod schemas for donation category validation
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

/**
 * Schema for validating number arrays (daily, monthly, amount)
 */
const numberArraySchema = z
  .array(z.number().positive('Each amount must be a positive number'))
  .optional()
  .nullable();

/**
 * Custom validation: At least one of daily, monthly, or amount must be provided
 */
const validateAmountFields = z
  .object({
    daily: numberArraySchema,
    monthly: numberArraySchema,
    amount: numberArraySchema,
  })
  .refine(
    (data) => {
      const hasDaily = data.daily && Array.isArray(data.daily) && data.daily.length > 0;
      const hasMonthly = data.monthly && Array.isArray(data.monthly) && data.monthly.length > 0;
      const hasAmount = data.amount && Array.isArray(data.amount) && data.amount.length > 0;
      return hasDaily || hasMonthly || hasAmount;
    },
    {
      message: 'At least one of daily, monthly, or amount must be provided',
      path: ['daily'], // Error will be shown on daily field
    }
  );

export const createDonationCategorySchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(255, 'Title must not exceed 255 characters'),
    subtitle: z
      .string()
      .min(1, 'Subtitle is required')
      .max(255, 'Subtitle must not exceed 255 characters'),
    video: z.string().url('Video must be a valid URL'),
    description: z.string().min(1, 'Description is required'),
    slug: z
      .string()
      .max(255, 'Slug must not exceed 255 characters')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase, hyphens only)')
      .optional(), // Optional for auto-generation
    expenseCategory: z.array(z.string().min(1)).min(1, 'Expense category is required'),
    // Thumbnail comes as a file only; do not accept URL/string in POST
    daily: numberArraySchema,
    monthly: numberArraySchema,
    amount: numberArraySchema,
    formTitle: z.string().min(1, 'Form title is required'),
    formDescription: z.string().min(1, 'Form description is required'),
  })
  .superRefine((data, ctx) => {
    const hasDaily = data.daily && Array.isArray(data.daily) && data.daily.length > 0;
    const hasMonthly = data.monthly && Array.isArray(data.monthly) && data.monthly.length > 0;
    const hasAmount = data.amount && Array.isArray(data.amount) && data.amount.length > 0;

    if (!hasDaily && !hasMonthly && !hasAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one of daily, monthly, or amount must be provided',
        path: ['daily'],
      });
    }
  });

export const updateDonationCategorySchema = z
  .object({
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
    video: z.string().url('Video must be a valid URL').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    slug: z
      .string()
      .max(255, 'Slug must not exceed 255 characters')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase, hyphens only)')
      .optional(),
    expenseCategory: z.array(z.string().min(1)).min(1).optional(),
    thumbnail: urlOrPathSchema.optional(), // Optional in schema, controller handles file
    daily: numberArraySchema,
    monthly: numberArraySchema,
    amount: numberArraySchema,
    formTitle: z.string().min(1, 'Form title is required').optional(),
    formDescription: z.string().min(1, 'Form description is required').optional(),
  })
  .refine(
    (data) => {
      // Only validate if at least one amount field is being updated
      const hasDaily = data.daily !== undefined;
      const hasMonthly = data.monthly !== undefined;
      const hasAmount = data.amount !== undefined;

      // If none of the amount fields are being updated, skip validation
      if (!hasDaily && !hasMonthly && !hasAmount) {
        return true;
      }

      // If any amount field is being updated, at least one must have values
      const hasDailyValues = data.daily && Array.isArray(data.daily) && data.daily.length > 0;
      const hasMonthlyValues = data.monthly && Array.isArray(data.monthly) && data.monthly.length > 0;
      const hasAmountValues = data.amount && Array.isArray(data.amount) && data.amount.length > 0;

      return hasDailyValues || hasMonthlyValues || hasAmountValues;
    },
    {
      message: 'At least one of daily, monthly, or amount must be provided',
      path: ['daily'],
    }
  );

export type CreateDonationCategoryInput = z.infer<typeof createDonationCategorySchema>;
export type UpdateDonationCategoryInput = z.infer<typeof updateDonationCategorySchema>;

