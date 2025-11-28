import mongoose, { Schema, Document, Model } from 'mongoose';

export const DONATION_PURPOSES = {
  ORPHAN_RESPONSIBILITY: 'orphan_responsibility',
  DEPRIVED_STUDENTS: 'deprived_students',
  WIDOW_RESPONSIBILITY: 'widow_responsibility',
  REHABILITATION_POOR_FAMILY: 'rehabilitation_poor_family',
  TUBE_WELL_INSTALL: 'tube_well_install',
  WUDU_PLACE_INSTALL: 'wudu_place_install',
  DOWRY_RESPONSIBILITY: 'dowry_responsibility',
  SKILL_DEVELOPMENT: 'skill_development',
  WINTER_CLOTHES: 'winter_clothes',
  MOSQUE_CONSTRUCTION: 'mosque_construction',
  ORPHANAGE_CONSTRUCTION: 'orphanage_construction',
  ZAKAT_FUND: 'zakat_fund',
  GENERAL_FUND: 'general_fund',
  IFTAR_PROGRAM: 'iftar_program',
  QURBANI_PROGRAM: 'qurbani_program',
  EMERGENCY_RELIEF: 'emergency_relief',
  SHELTERLESS_HOUSING: 'shelterless_housing',
} as const;

export const DONATION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type DonationPurpose = (typeof DONATION_PURPOSES)[keyof typeof DONATION_PURPOSES];
export type DonationStatus = (typeof DONATION_STATUS)[keyof typeof DONATION_STATUS];

export interface IDonation extends Document {
  purpose: string;
  contact: string; // Email or phone
  amount: number;
  name?: string;
  behalf?: string;
  status: DonationStatus;
  tran_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDonationModel extends Model<IDonation> {
  // Add static methods here if needed
}

const donationSchema = new Schema<IDonation>(
  {
    name: {
      type: String,
      required: [false, 'Name is not required'],
      trim: true,
    },
    behalf: {
      type: String,
      required: [false, 'Behalf is not required'],
      trim: true,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, 'Contact is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(DONATION_STATUS),
        message: 'Invalid donation status',
      },
      default: DONATION_STATUS.PENDING,
    },
    tran_id: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for faster queries
donationSchema.index({ status: 1 });
donationSchema.index({ purpose: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ contact: 1 });

export const Donation: IDonationModel =
  (mongoose.models.Donation as IDonationModel) ||
  mongoose.model<IDonation, IDonationModel>('Donation', donationSchema);

