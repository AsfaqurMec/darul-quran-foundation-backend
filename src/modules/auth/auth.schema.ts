import { z } from 'zod';
import { loginSchema, registerSchema } from '@/modules/users/user.schema';

/**
 * Zod schemas for authentication
 */

export { registerSchema, loginSchema };

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

