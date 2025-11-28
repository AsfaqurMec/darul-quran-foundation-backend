import { z } from 'zod';
import { ROLES } from '@/constants';

/**
 * Zod schemas for user validation
 */

const phoneRegex = /^[0-9]\d{7,14}$/;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must not exceed 100 characters'),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().regex(phoneRegex, 'Invalid phone number').optional(),
    // address: z
    //   .string()
    //   .max(255, 'Address must not exceed 255 characters')
    //   .optional(),
    // pictures: z.array(z.string().url('Picture must be a valid URL')).optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    role: z.enum([ROLES.ADMIN, ROLES.EDITOR, ROLES.DONORS]).optional(),
  })
  .refine(
    (data) => {
      const hasEmail = Boolean(data.email && data.email.trim());
      const hasPhone = Boolean(data.phone && data.phone.trim());
      return hasEmail || hasPhone;
    },
    {
      message: 'Either email or phone must be provided',
      path: ['email'],
    }
  );

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Identifier must be at least 3 characters')
    .max(255, 'Identifier must not exceed 255 characters'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must not exceed 100 characters')
      .optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().regex(phoneRegex, 'Invalid phone number').optional(),
    // address: z
    //   .string()
    //   .max(255, 'Address must not exceed 255 characters')
    //   .optional(),
    // pictures: z.array(z.string().url('Picture must be a valid URL')).optional(),
    role: z.enum([ROLES.ADMIN, ROLES.EDITOR, ROLES.DONORS]).optional(),
    // avatar: z.string().url('Avatar must be a valid URL').optional(),
  })
  .refine(
    (data) => {
      if (!data.email && !data.phone) {
        return true;
      }
      const hasEmail = Boolean(data.email && data.email.trim());
      const hasPhone = Boolean(data.phone && data.phone.trim());
      return hasEmail || hasPhone;
    },
    {
      message: 'Either email or phone must be provided',
      path: ['email'],
    }
  );

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Schema for creating admin/editor user
export const createAdminSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  role: z.enum([ROLES.ADMIN, ROLES.EDITOR], {
    errorMap: () => ({ message: 'Role must be either admin or editor' }),
  }),
});

// Schema for updating user (admin only)
export const updateUserAdminSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must not exceed 100 characters')
      .optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().regex(phoneRegex, 'Invalid phone number').optional(),
    role: z.enum([ROLES.ADMIN, ROLES.EDITOR, ROLES.DONORS]).optional(),
    // companyName: z
    //   .string()
    //   .max(255, 'Company name must not exceed 255 characters')
    //   .optional(),
    // fullAddress: z
    //   .string()
    //   .max(500, 'Full address must not exceed 500 characters')
    //   .optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided
      return Object.keys(data).length > 0;
    },
    {
      message: 'At least one field must be provided for update',
    }
  );

// Schema for query parameters (pagination, search, filter)
export const getUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive().max(100)),
  searchTerm: z.string().optional(),
  role: z.enum([ROLES.ADMIN, ROLES.EDITOR, ROLES.DONORS]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateUserAdminInput = z.infer<typeof updateUserAdminSchema>;
export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;

