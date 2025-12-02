import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGalleryCategory extends Document {
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGalleryCategoryModel extends Model<IGalleryCategory> {
  // Add static methods here if needed
}

const galleryCategorySchema = new Schema<IGalleryCategory>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      unique: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [255, 'Title must not exceed 255 characters'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for faster queries
galleryCategorySchema.index({ title: 1 }); // Unique index is automatically created by unique: true
galleryCategorySchema.index({ createdAt: -1 });

export const GalleryCategory: IGalleryCategoryModel =
  (mongoose.models.GalleryCategory as IGalleryCategoryModel) ||
  mongoose.model<IGalleryCategory, IGalleryCategoryModel>('GalleryCategory', galleryCategorySchema);

