import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProgram extends Document {
  title: string;
  subtitle: string;
  thumbnail: string; // URL
  video: string; // URL
  description: string; // Preserve line breaks
  media: string[]; // Array of image URLs
  slug: string; // URL-friendly unique identifier
  area?: string;
  duration?: string;
  beneficiary: string[];
  expenseCategory: string[];
  projectGoalsAndObjectives: string[];
  activities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgramModel extends Model<IProgram> {
  // Add static methods here if needed
}

const programSchema = new Schema<IProgram>(
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
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required'],
      trim: true,
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
      // Preserve line breaks - no trim on description
    },
    media: {
      type: [String],
      required: [true, 'Media is required'],
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one media image is required',
      },
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
    area: {
      type: String,
      default: null,
      trim: true,
    },
    duration: {
      type: String,
      default: null,
      trim: true,
    },
    beneficiary: {
      type: [String],
      default: [],
    },
    expenseCategory: {
      type: [String],
      default: [],
    },
    projectGoalsAndObjectives: {
      type: [String],
      default: [],
    },
    activities: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for faster queries
programSchema.index({ slug: 1 }, { unique: true });
programSchema.index({ createdAt: -1 });
programSchema.index({ title: 'text', subtitle: 'text', description: 'text' }); // Text search index

export const Program: IProgramModel =
  (mongoose.models.Program as IProgramModel) ||
  mongoose.model<IProgram, IProgramModel>('Program', programSchema);

