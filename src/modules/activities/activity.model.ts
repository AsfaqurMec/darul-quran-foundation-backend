import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  tag: string;
  description: string;
  image: string; // URL
  thumbnail: string; // URL
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityModel extends Model<IActivity> {
  // Add static methods here if needed
}

const activitySchema = new Schema<IActivity>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [255, 'Title must not exceed 255 characters'],
    },
    tag: {
      type: String,
      required: [true, 'Tag is required'],
      trim: true,
      maxlength: [100, 'Tag must not exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for faster queries
activitySchema.index({ tag: 1 });
activitySchema.index({ createdAt: -1 });

export const Activity: IActivityModel =
  (mongoose.models.Activity as IActivityModel) ||
  mongoose.model<IActivity, IActivityModel>('Activity', activitySchema);

