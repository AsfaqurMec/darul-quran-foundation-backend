import mongoose, { Schema, Document, Model } from 'mongoose';
import { config } from '@/config';
import { MemberGender, MemberType } from './member.model';

export type MemberPaymentSessionStatus = 'pending' | 'completed' | 'failed' | 'expired';

export interface MemberApplicationFormData {
  type: MemberType;
  amount: number;
  name: string;
  fatherName: string;
  gender: MemberGender;
  mobile: string;
  isOverseas: boolean;
  email?: string;
  occupation: string;
  reference?: string;
  address: string;
}

export interface IMemberPaymentSession extends Document {
  transactionId: string;
  status: MemberPaymentSessionStatus;
  formData: MemberApplicationFormData;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  sslSessionKey?: string;
  gatewayUrl?: string;
  sslResponse?: Record<string, unknown>;
  sslValidationData?: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMemberPaymentSessionModel extends Model<IMemberPaymentSession> {}

const formDataSchema = new Schema<MemberApplicationFormData>(
  {
    type: { type: String, enum: ['lifetime', 'donor'], required: true },
    amount: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    mobile: { type: String, required: true, trim: true },
    isOverseas: { type: Boolean, default: false },
    email: { type: String, trim: true, lowercase: true },
    occupation: { type: String, required: true, trim: true },
    reference: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const memberPaymentSessionSchema = new Schema<IMemberPaymentSession>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'expired'],
      default: 'pending',
      index: true,
    },
    formData: {
      type: formDataSchema,
      required: true,
    },
    successUrl: {
      type: String,
      required: true,
    },
    failUrl: {
      type: String,
      required: true,
    },
    cancelUrl: {
      type: String,
      required: true,
    },
    sslSessionKey: {
      type: String,
    },
    gatewayUrl: {
      type: String,
    },
    sslResponse: {
      type: Schema.Types.Mixed,
    },
    sslValidationData: {
      type: Schema.Types.Mixed,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + config.memberApplication.sessionTtlHours * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

memberPaymentSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const MemberPaymentSession: IMemberPaymentSessionModel =
  (mongoose.models.MemberPaymentSession as IMemberPaymentSessionModel) ||
  mongoose.model<IMemberPaymentSession, IMemberPaymentSessionModel>('MemberPaymentSession', memberPaymentSessionSchema);


