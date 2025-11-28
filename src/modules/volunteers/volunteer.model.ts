import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVolunteerApplication extends Document {
  // Personal Information
  name: string;
  fatherName: string;
  mobileNumber: string;
  mobileCountryCode: string;
  email: string;

  // Professional Information
  currentProfession: string;
  organizationName: string;
  workplaceAddress: string;

  // Current Address
  currentDivision: string;
  currentDistrict: string;
  currentUpazila: string;
  currentUnion: string;
  currentFullAddress: string;

  // Permanent Address
  permanentDivision: string;
  permanentDistrict: string;
  permanentUpazila: string;
  permanentUnion: string;
  permanentFullAddress: string;

  // Overseas (Optional)
  overseasCountry?: string;
  overseasAddress?: string;

  // Social Media
  facebookId?: string;
  linkedinId?: string;
  whatsappNumber?: string;
  whatsappCountryCode?: string;
  telegramNumber?: string;
  telegramCountryCode?: string;
  fbNotUsed: boolean;

  // Educational Qualification
  educationMedium: string;
  educationLevel: string;
  currentClassYear: string;
  departmentDegree?: string;
  lastInstitutionName: string;

  // Previous Volunteer Experience
  wasVolunteer: boolean;
  previousProjectName?: string;
  previousProjectLocation?: string;
  previousBatch?: string;
  previousBeneficiariesCount?: number;

  // Profile Image
  profileImage?: string;

  // Status
  status: 'pending' | 'approved' | 'rejected';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface IVolunteerApplicationModel extends Model<IVolunteerApplication> {
  // Add static methods here if needed
}

const volunteerApplicationSchema = new Schema<IVolunteerApplication>(
  {
    // Personal Information
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [255, 'Name must not exceed 255 characters'],
    },
    fatherName: {
      type: String,
      required: [true, 'Father name is required'],
      trim: true,
      maxlength: [255, 'Father name must not exceed 255 characters'],
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    mobileCountryCode: {
      type: String,
      required: [true, 'Mobile country code is required'],
      default: '+880',
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    // Professional Information
    currentProfession: {
      type: String,
      required: [true, 'Current profession is required'],
      trim: true,
      maxlength: [255, 'Current profession must not exceed 255 characters'],
    },
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [255, 'Organization name must not exceed 255 characters'],
    },
    workplaceAddress: {
      type: String,
      required: [true, 'Workplace address is required'],
      trim: true,
    },

    // Current Address
    currentDivision: {
      type: String,
      required: [true, 'Current division is required'],
      trim: true,
    },
    currentDistrict: {
      type: String,
      required: [true, 'Current district is required'],
      trim: true,
    },
    currentUpazila: {
      type: String,
      required: [true, 'Current upazila is required'],
      trim: true,
    },
    currentUnion: {
      type: String,
      required: [true, 'Current union is required'],
      trim: true,
    },
    currentFullAddress: {
      type: String,
      required: [true, 'Current full address is required'],
      trim: true,
    },

    // Permanent Address
    permanentDivision: {
      type: String,
      required: [true, 'Permanent division is required'],
      trim: true,
    },
    permanentDistrict: {
      type: String,
      required: [true, 'Permanent district is required'],
      trim: true,
    },
    permanentUpazila: {
      type: String,
      required: [true, 'Permanent upazila is required'],
      trim: true,
    },
    permanentUnion: {
      type: String,
      required: [true, 'Permanent union is required'],
      trim: true,
    },
    permanentFullAddress: {
      type: String,
      required: [true, 'Permanent full address is required'],
      trim: true,
    },

    // Overseas (Optional)
    overseasCountry: {
      type: String,
      default: null,
      trim: true,
    },
    overseasAddress: {
      type: String,
      default: null,
      trim: true,
    },

    // Social Media
    facebookId: {
      type: String,
      default: null,
      trim: true,
    },
    linkedinId: {
      type: String,
      default: null,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      default: null,
      trim: true,
    },
    whatsappCountryCode: {
      type: String,
      default: '+880',
      trim: true,
    },
    telegramNumber: {
      type: String,
      default: null,
      trim: true,
    },
    telegramCountryCode: {
      type: String,
      default: '+880',
      trim: true,
    },
    fbNotUsed: {
      type: Boolean,
      required: [true, 'fbNotUsed is required'],
      default: false,
    },

    // Educational Qualification
    educationMedium: {
      type: String,
      required: [true, 'Education medium is required'],
      trim: true,
    },
    educationLevel: {
      type: String,
      required: [true, 'Education level is required'],
      trim: true,
    },
    currentClassYear: {
      type: String,
      required: [true, 'Current class/year is required'],
      trim: true,
    },
    departmentDegree: {
      type: String,
      default: null,
      trim: true,
    },
    lastInstitutionName: {
      type: String,
      required: [true, 'Last institution name is required'],
      trim: true,
      maxlength: [255, 'Last institution name must not exceed 255 characters'],
    },

    // Previous Volunteer Experience
    wasVolunteer: {
      type: Boolean,
      required: [true, 'wasVolunteer is required'],
      default: false,
    },
    previousProjectName: {
      type: String,
      default: null,
      trim: true,
    },
    previousProjectLocation: {
      type: String,
      default: null,
      trim: true,
    },
    previousBatch: {
      type: String,
      default: null,
      trim: true,
    },
    previousBeneficiariesCount: {
      type: Number,
      default: null,
    },

    // Profile Image
    profileImage: {
      type: String,
      default: null,
      trim: true,
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for faster queries
volunteerApplicationSchema.index({ status: 1 });
volunteerApplicationSchema.index({ createdAt: -1 });
volunteerApplicationSchema.index({ email: 1 });
volunteerApplicationSchema.index({ mobileNumber: 1 });
volunteerApplicationSchema.index({ name: 'text', email: 'text', mobileNumber: 'text' }); // Text search index

export const VolunteerApplication: IVolunteerApplicationModel =
  (mongoose.models.VolunteerApplication as IVolunteerApplicationModel) ||
  mongoose.model<IVolunteerApplication, IVolunteerApplicationModel>(
    'VolunteerApplication',
    volunteerApplicationSchema
  );

