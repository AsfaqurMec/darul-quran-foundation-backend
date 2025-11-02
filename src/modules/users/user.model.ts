import mongoose, { Schema, Document, Model } from 'mongoose';
import { ROLES, Role } from '@/constants';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  refreshTokenHash?: string; // For single device, use array for multi-device
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends Model<IUser> {
  // Add static methods here if needed
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for faster queries
userSchema.index({ email: 1 });

// Use mongoose-unique-validator for better duplicate key error messages
// Note: This is already in package.json, uncomment if needed
// userSchema.plugin(require('mongoose-unique-validator'));

export const User: IUserModel =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUser, IUserModel>('User', userSchema);

