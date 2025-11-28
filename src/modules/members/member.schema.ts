import { z } from 'zod';

const BD_MOBILE_REGEX = /^01[0-9]{9}$/;

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  throw new Error('Amount must be a valid number');
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return Boolean(value);
};

const amountSchema = z
  .union([z.number(), z.string()])
  .transform((value) => toNumber(value))
  .refine((value) => value > 0, { message: 'Amount must be greater than zero' });

const booleanSchema = z.union([z.boolean(), z.string()]).transform((value) => toBoolean(value));

const baseMemberFormObject = z.object({
  type: z.enum(['lifetime', 'donor'], { required_error: 'Member type is required' }),
  amount: amountSchema,
  name: z.string().min(1, 'Name is required').max(255, 'Name must not exceed 255 characters'),
  fatherName: z.string().min(1, 'Father name is required').max(255, 'Father name must not exceed 255 characters'),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }),
  mobile: z
    .string()
    .min(1, 'Mobile number is required').optional(),
    //.regex(BD_MOBILE_REGEX, 'Mobile number must be a valid Bangladeshi number (11 digits starting with 01)'),
  isOverseas: booleanSchema.optional().default(false),
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  district: z.string().min(1, 'Occupation is required').optional(),
  occupation: z.string().min(1, 'Occupation is required').optional(),
  reference: z.string().max(255).optional(),
  address: z.string().min(1, 'Address is required'),
});

const enhanceMemberFormSchema = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .transform((data) => {
      const { district, occupation, ...rest } = data;
      const resolvedOccupation = occupation && occupation.trim().length > 0 ? occupation : district;
      return {
        ...rest,
        occupation: resolvedOccupation?.trim(),
      };
    })
    .refine((data) => Boolean(data.occupation && data.occupation.length > 0), {
      message: 'Occupation is required',
      path: ['occupation'],
    })
    .refine(
      (data) => {
        if (data.type === 'lifetime') {
          return data.amount >= 100000;
        }
        return data.amount >= 50000;
      },
      {
        message: 'Amount is below the minimum for the selected member type',
        path: ['amount'],
      }
    )
    .refine(
      (data) => {
        if (data.isOverseas) {
          return Boolean(data.email);
        }
        return true;
      },
      {
        message: 'Email is required for overseas members',
        path: ['email'],
      }
    );

const baseMemberFormSchema = enhanceMemberFormSchema(baseMemberFormObject);

export const initiateMemberPaymentSchema = enhanceMemberFormSchema(
  baseMemberFormObject.extend({
    // successUrl: z.string().url('Valid successUrl is required'),
    // failUrl: z.string().url('Valid failUrl is required'),
    // cancelUrl: z.string().url('Valid cancelUrl is required'),
    tran_id: z.string().min(1, 'Tran_id must not be empty').optional(),
    paymentMethod: z.enum(['bank_transfer', 'bank_deposit', 'online'], {
      required_error: 'Payment method is required',
    }),
  })
);

export const completeMemberPaymentSchema = z
  .object({
    transactionId: z.string().min(1, 'transactionId is required'),
    valId: z.string().optional(),
    val_id: z.string().optional(),
    status: z.string().optional(),
    amount: amountSchema.optional(),
    currency: z.string().optional(),
    bankTxnId: z.string().optional(),
    cardType: z.string().optional(),
    storeAmount: z.string().optional(),
  })
  .transform((data) => {
    const { val_id, valId, ...rest } = data;
    return {
      ...rest,
      valId: valId || val_id,
    };
  })
  .refine((data) => Boolean(data.valId), {
    message: 'valId is required',
    path: ['valId'],
  });

export const submitMemberApplicationSchema = enhanceMemberFormSchema(
  baseMemberFormObject
    .extend({
      paymentMethod: z.enum(['bank_transfer', 'bank_deposit'], {
        required_error: 'Payment method is required',
      }),
      transactionId: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.paymentMethod === 'bank_transfer') {
          return Boolean(data.transactionId && data.transactionId.trim().length > 0);
        }
        return true;
      },
      {
        message: 'transactionId is required for bank transfers',
        path: ['transactionId'],
      }
    )
);

export const getMemberApplicationsQuerySchema = z.object({
  page: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        return Number.isNaN(parsed) ? 1 : parsed;
      }
      return val;
    })
    .pipe(z.number().int().positive())
    .default(1)
    .optional(),
  limit: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        return Number.isNaN(parsed) ? 10 : parsed;
      }
      return val;
    })
    .pipe(z.number().int().positive().max(100))
    .default(10)
    .optional(),
  status: z.enum(['pending_approval', 'approved', 'rejected']).optional(),
  paymentStatus: z.enum(['pending', 'completed', 'cancel', 'failed', 'pending_verification']).optional(),
  type: z.enum(['lifetime', 'donor']).optional(),
  searchTerm: z.string().optional(),
});

export const updateMemberApplicationStatusSchema = z.object({
  status: z.enum(['pending_approval', 'approved', 'rejected'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be one of: pending_approval, approved, rejected',
  }),
});

export const updateMemberApplicationPaymentStatusSchema = z.object({
  paymentStatus: z.enum(['pending', 'completed', 'cancel', 'failed', 'pending_verification'], {
    required_error: 'Payment status is required',
    invalid_type_error: 'Payment status must be one of: pending, completed, cancel, failed',
  }),
});
export type InitiateMemberPaymentInput = z.infer<typeof initiateMemberPaymentSchema>;
export type CompleteMemberPaymentInput = z.infer<typeof completeMemberPaymentSchema>;
export type SubmitMemberApplicationInput = z.infer<typeof submitMemberApplicationSchema>;
export type GetMemberApplicationsQueryInput = z.infer<typeof getMemberApplicationsQuerySchema>;
export type UpdateMemberApplicationStatusInput = z.infer<typeof updateMemberApplicationStatusSchema>;
export type UpdateMemberApplicationPaymentStatusInput = z.infer<typeof updateMemberApplicationPaymentStatusSchema>;
