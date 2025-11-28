import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  excerpt: string;
  date: string; // YYYY-MM-DD format
  thumbnail: string; // URL
  images: string[];
  fullContent: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogModel extends Model<IBlog> {
  // Add static methods here if needed
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [255, 'Title must not exceed 255 characters'],
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
      validate: [
        (val: string[]) => val.every((item) => typeof item === 'string' && item.trim().length > 0),
        'Images must be an array of URLs',
      ],
    },
    fullContent: {
      type: String,
      required: [true, 'Full content is required'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for faster queries
blogSchema.index({ date: -1 });
blogSchema.index({ createdAt: -1 });

export const Blog: IBlogModel =
  (mongoose.models.Blog as IBlogModel) ||
  mongoose.model<IBlog, IBlogModel>('Blog', blogSchema);

