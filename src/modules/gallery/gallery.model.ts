import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGalleryItem extends Document {
  title: string;
  media: string; // URL to image/video
  category: string;
  type: 'image' | 'video';
  createdAt: Date;
  updatedAt: Date;
}

export interface IGalleryItemModel extends Model<IGalleryItem> {
  // Add static methods here if needed
}

const galleryItemSchema = new Schema<IGalleryItem>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [255, 'Title must not exceed 255 characters'],
    },
    media: {
      type: String,
      required: [true, 'Media URL is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [100, 'Category must not exceed 100 characters'],
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: [true, 'Type is required'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for faster queries
galleryItemSchema.index({ title: 'text' });
galleryItemSchema.index({ category: 1 });
galleryItemSchema.index({ type: 1 });
galleryItemSchema.index({ createdAt: -1 });

export const GalleryItem: IGalleryItemModel =
  (mongoose.models.GalleryItem as IGalleryItemModel) ||
  mongoose.model<IGalleryItem, IGalleryItemModel>('GalleryItem', galleryItemSchema);

