import mongoose, { Schema, Document, Model } from 'mongoose';
import { ROLES, Role } from '@/constants';

export interface IUser extends Document {
  fullName: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: Role;
  refreshTokenHash?: string; // For single device, use array for multi-device
  avatar?: string;
  address?: string;
  pictures: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends Model<IUser> {
  // Add static methods here if needed
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name must not exceed 100 characters'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Don't include password hash in queries by default
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.DONORS,
    },
    refreshTokenHash: {
      type: String,
      select: false, // Don't include refresh token hash in queries by default
    },
    avatar: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
      trim: true,
      maxlength: [255, 'Address must not exceed 255 characters'],
    },
    pictures: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for faster queries
userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ phone: 1 }, { sparse: true });

// Use mongoose-unique-validator for better duplicate key error messages
// Note: This is already in package.json, uncomment if needed
// userSchema.plugin(require('mongoose-unique-validator'));

export const User: IUserModel =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUser, IUserModel>('User', userSchema);

