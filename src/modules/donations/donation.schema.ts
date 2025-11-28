import { z } from 'zod';
import { DONATION_PURPOSES, DONATION_STATUS } from './donation.model';

/**
 * Zod schemas for donation validation
 */

const emailRegex = /^\S+@\S+\.\S+$/;
const phoneRegex = /^[0-9]\d{7,14}$/;

export const createDonationSchema = z.object({
  // purpose: z.enum(
  //   Object.values(DONATION_PURPOSES) as [string, ...string[]],
  purpose: z.string().optional(),
    // {
    //   errorMap: () => ({ 
    //     message: `Invalid donation purpose. Must be one of: ${Object.values(DONATION_PURPOSES).join(', ')}` 
    //   }),
    // }
  // ),
  contact: z
    .string()
    .min(1, 'Contact is required')
    .refine(
      (val) => emailRegex.test(val) || phoneRegex.test(val),
      {
        message: 'Contact must be a valid email or phone number',
      }
    ),
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .min(0.01, 'Amount must be at least 0.01'),
  name: z
    .string()
    .trim()
    .optional(),
  behalf: z
    .string()
    .trim()
    .optional(),
  purposeLabel: z
    .string()
    .optional(),
});

export const updateDonationSchema = z.object({
  // purpose: z
  //   .enum(Object.values(DONATION_PURPOSES) as [string, ...string[]], {
  //     errorMap: () => ({ 
  //       message: `Invalid donation purpose. Must be one of: ${Object.values(DONATION_PURPOSES).join(', ')}` 
  //     }),
  //   })
    purpose: z.string().optional(),
  contact: z
    .string()
    .min(1, 'Contact is required')
    .refine(
      (val) => emailRegex.test(val) || phoneRegex.test(val),
      {
        message: 'Contact must be a valid email or phone number',
      }
    )
    .optional(),
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .min(0.01, 'Amount must be at least 0.01')
    .optional(),
  status: z
    .enum(Object.values(DONATION_STATUS) as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid donation status' }),
    })
    .optional(),
});

export type CreateDonationInput = z.infer<typeof createDonationSchema>;
export type UpdateDonationInput = z.infer<typeof updateDonationSchema>;

