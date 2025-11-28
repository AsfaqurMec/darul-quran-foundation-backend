import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDonationCategory extends Document {
  title: string;
  subtitle: string;
  video: string; // URL
  description: string; // Preserve line breaks
  slug: string; // URL-friendly unique identifier
  expenseCategory: string[];
  thumbnail: string; // URL/path
  daily?: number[]; // Optional array of daily donation amounts
  monthly?: number[]; // Optional array of monthly donation amounts
  amount?: number[]; // Optional array of donation amounts
  formTitle: string;
  formDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDonationCategoryModel extends Model<IDonationCategory> {
  // Add static methods here if needed
}

const donationCategorySchema = new Schema<IDonationCategory>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [255, 'Title must not exceed 255 characters'],
    },
    subtitle: {
      type: String,
      required: [true, 'Subtitle is required'],
      trim: true,
      maxlength: [255, 'Subtitle must not exceed 255 characters'],
    },
    video: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Video must be a valid URL',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase, hyphens only)'],
      maxlength: [255, 'Slug must not exceed 255 characters'],
    },
    expenseCategory: {
      type: [String],
      required: [true, 'Expense category is required'],
      default: undefined,
      validate: {
        validator: function (v: string[] | undefined) {
          return Array.isArray(v) && v.length > 0 && v.every((s) => typeof s === 'string' && s.trim().length > 0);
        },
        message: 'Expense category must be a non-empty array of strings',
      },
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required'],
      trim: true,
    },
    daily: {
      type: [Number],
      default: undefined,
      validate: {
        validator: function (v: number[] | undefined) {
          if (!v || v.length === 0) return true; // Allow empty or undefined
          return v.every((n) => typeof n === 'number' && n > 0);
        },
        message: 'Daily amounts must be an array of positive numbers',
      },
    },
    monthly: {
      type: [Number],
      default: undefined,
      validate: {
        validator: function (v: number[] | undefined) {
          if (!v || v.length === 0) return true; // Allow empty or undefined
          return v.every((n) => typeof n === 'number' && n > 0);
        },
        message: 'Monthly amounts must be an array of positive numbers',
      },
    },
    amount: {
      type: [Number],
      default: undefined,
      validate: {
        validator: function (v: number[] | undefined) {
          if (!v || v.length === 0) return true; // Allow empty or undefined
          return v.every((n) => typeof n === 'number' && n > 0);
        },
        message: 'Amounts must be an array of positive numbers',
      },
    },
    formTitle: {
      type: String,
      required: [true, 'Form title is required'],
      trim: true,
    },
    formDescription: {
      type: String,
      required: [true, 'Form description is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster slug lookups
donationCategorySchema.index({ slug: 1 });

// Validation: At least one of daily, monthly, or amount must be provided
donationCategorySchema.pre('save', function (next) {
  const hasDaily = this.daily && Array.isArray(this.daily) && this.daily.length > 0;
  const hasMonthly = this.monthly && Array.isArray(this.monthly) && this.monthly.length > 0;
  const hasAmount = this.amount && Array.isArray(this.amount) && this.amount.length > 0;

  if (!hasDaily && !hasMonthly && !hasAmount) {
    return next(new Error('At least one of daily, monthly, or amount must be provided'));
  }
  next();
});

export const DonationCategory: IDonationCategoryModel = mongoose.model<IDonationCategory, IDonationCategoryModel>(
  'DonationCategory',
  donationCategorySchema
);

