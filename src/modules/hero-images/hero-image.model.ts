import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroImage extends Document {
  image: string; // URL or path
  title?: string;
  description?: string;
  order: number; // Display order
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHeroImageModel extends Model<IHeroImage> {
  // Add static methods here if needed
}

const heroImageSchema = new Schema<IHeroImage>(
  {
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [255, 'Title must not exceed 255 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must not exceed 1000 characters'],
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order must be a non-negative number'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for faster queries
heroImageSchema.index({ order: 1 });
heroImageSchema.index({ isActive: 1 });
heroImageSchema.index({ createdAt: -1 });

export const HeroImage: IHeroImageModel =
  (mongoose.models.HeroImage as IHeroImageModel) ||
  mongoose.model<IHeroImage, IHeroImageModel>('HeroImage', heroImageSchema);

