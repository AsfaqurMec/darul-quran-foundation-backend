import { z } from 'zod';

/**
 * Zod schemas for volunteer application validation
 */

// Base schema for volunteer application
const baseVolunteerSchema = z.object({
  // Personal Information
  name: z.string().min(1, 'Name is required').max(255, 'Name must not exceed 255 characters'),
  fatherName: z.string().min(1, 'Father name is required').max(255, 'Father name must not exceed 255 characters'),
  mobileNumber: z.string().min(1, 'Mobile number is required'),
  mobileCountryCode: z.string().default('+880'),
  email: z.string().email('Invalid email address'),

  // Professional Information
  currentProfession: z.string().min(1, 'Current profession is required').max(255, 'Current profession must not exceed 255 characters'),
  organizationName: z.string().min(1, 'Organization name is required').max(255, 'Organization name must not exceed 255 characters'),
  workplaceAddress: z.string().min(1, 'Workplace address is required'),

  // Current Address
  currentDivision: z.string().min(1, 'Current division is required'),
  currentDistrict: z.string().min(1, 'Current district is required'),
  currentUpazila: z.string().min(1, 'Current upazila is required'),
  currentUnion: z.string().min(1, 'Current union is required'),
  currentFullAddress: z.string().min(1, 'Current full address is required'),

  // Permanent Address
  permanentDivision: z.string().min(1, 'Permanent division is required'),
  permanentDistrict: z.string().min(1, 'Permanent district is required'),
  permanentUpazila: z.string().min(1, 'Permanent upazila is required'),
  permanentUnion: z.string().min(1, 'Permanent union is required'),
  permanentFullAddress: z.string().min(1, 'Permanent full address is required'),

  // Overseas (Optional)
  overseasCountry: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  overseasAddress: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),

  // Social Media
  facebookId: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  linkedinId: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  whatsappNumber: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  whatsappCountryCode: z.string().default('+880').optional(),
  telegramNumber: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  telegramCountryCode: z.string().default('+880').optional(),
  fbNotUsed: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        return val === 'true';
      }
      return val;
    })
    .pipe(z.boolean()),

  // Educational Qualification
  educationMedium: z.string().min(1, 'Education medium is required'),
  educationLevel: z.string().min(1, 'Education level is required'),
  currentClassYear: z.string().min(1, 'Current class/year is required'),
  departmentDegree: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  lastInstitutionName: z.string().min(1, 'Last institution name is required').max(255, 'Last institution name must not exceed 255 characters'),

  // Previous Volunteer Experience
  wasVolunteer: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        return val === 'true';
      }
      return val;
    })
    .pipe(z.boolean()),
  previousProjectName: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  previousProjectLocation: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  previousBatch: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  previousBeneficiariesCount: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? undefined : parsed;
      }
      return val;
    })
    .optional()
    .nullable(),

  // Profile Image (optional, handled separately as file upload)
  profileImage: z.string().optional().nullable(),

  // Status (default handled in model)
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

/**
 * Create volunteer application schema with conditional validations
 */
export const createVolunteerSchema = baseVolunteerSchema
  .refine(
    (data) => {
      // If fbNotUsed is false, facebookId is required
      if (data.fbNotUsed === false) {
        if (!data.facebookId || (typeof data.facebookId === 'string' && data.facebookId.trim() === '')) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Facebook ID is required when fbNotUsed is false',
      path: ['facebookId'],
    }
  )
  .refine(
    (data) => {
      // If wasVolunteer is true, all previous volunteer fields are required
      if (data.wasVolunteer === true) {
        if (
          !data.previousProjectName ||
          (typeof data.previousProjectName === 'string' && data.previousProjectName.trim() === '') ||
          !data.previousProjectLocation ||
          (typeof data.previousProjectLocation === 'string' && data.previousProjectLocation.trim() === '') ||
          !data.previousBatch ||
          (typeof data.previousBatch === 'string' && data.previousBatch.trim() === '') ||
          data.previousBeneficiariesCount === null ||
          data.previousBeneficiariesCount === undefined
        ) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'All previous volunteer experience fields are required when wasVolunteer is true',
      path: ['previousProjectName'],
    }
  );

/**
 * Update volunteer status schema
 */
export const updateVolunteerStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be one of: pending, approved, rejected',
  }),
});

/**
 * Query parameters schema for GET /volunteers
 */
export const getVolunteersQuerySchema = z.object({
  page: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? 1 : parsed;
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
        return isNaN(parsed) ? 10 : parsed;
      }
      return val;
    })
    .pipe(z.number().int().positive().max(100))
    .default(10)
    .optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  searchTerm: z.string().optional(),
});

export type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;
export type UpdateVolunteerStatusInput = z.infer<typeof updateVolunteerStatusSchema>;
export type GetVolunteersQueryInput = z.infer<typeof getVolunteersQuerySchema>;

