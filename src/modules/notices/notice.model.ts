import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotice extends Document {
  title: string;
  subTitle: string;
  date: string; // YYYY-MM-DD format
  category: string;
  fullContent: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoticeModel extends Model<INotice> {
  // Add static methods here if needed
}

const noticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [255, 'Title must not exceed 255 characters'],
    },
    subTitle: {
      type: String,
      required: [true, 'Subtitle is required'],
      trim: true,
      minlength: [1, 'Subtitle must be at least 1 character'],
      maxlength: [255, 'Subtitle must not exceed 255 characters'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [100, 'Category must not exceed 100 characters'],
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
noticeSchema.index({ category: 1 });
noticeSchema.index({ date: -1 });
noticeSchema.index({ createdAt: -1 });

export const Notice: INoticeModel =
  (mongoose.models.Notice as INoticeModel) ||
  mongoose.model<INotice, INoticeModel>('Notice', noticeSchema);

