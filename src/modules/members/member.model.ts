import mongoose, { Schema, Document, Model } from 'mongoose';

export type MemberType = 'lifetime' | 'donor';
export type MemberGender = 'male' | 'female';
export type MemberPaymentMethod = 'online' | 'bank_transfer' | 'bank_deposit';
export type MemberPaymentStatus = 'pending' | 'completed' | 'pending_verification' | 'failed' | "cancel";
export type MemberApplicationStatus = 'pending_approval' | 'approved' | 'rejected';

export interface IMemberApplication extends Document {
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
  paymentMethod: MemberPaymentMethod;
  tran_id?: string;
  transactionId?: string;
  paymentDocumentUrl?: string;
  paymentStatus: MemberPaymentStatus;
  applicationStatus: MemberApplicationStatus;
  sslcommerzValId?: string;
  sslcommerzData?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMemberApplicationModel extends Model<IMemberApplication> {}

const memberApplicationSchema = new Schema<IMemberApplication>(
  {
    type: {
      type: String,
      enum: ['lifetime', 'donor'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    isOverseas: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    occupation: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'bank_transfer', 'bank_deposit'],
      required: true,
    },
    tran_id: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentDocumentUrl: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'pending_verification', 'failed', 'cancel'],
      default: 'pending',
      required: true,
    },
    applicationStatus: {
      type: String,
      enum: ['pending_approval', 'approved', 'rejected'],
      default: 'pending_approval',
      required: true,
    },
    sslcommerzValId: {
      type: String,
      trim: true,
    },
    sslcommerzData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

memberApplicationSchema.index({ tran_id: 1 });
memberApplicationSchema.index({ transactionId: 1 });
memberApplicationSchema.index({ paymentStatus: 1 });
memberApplicationSchema.index({ applicationStatus: 1 });
memberApplicationSchema.index({ createdAt: -1 });

export const MemberApplication: IMemberApplicationModel =
  (mongoose.models.MemberApplication as IMemberApplicationModel) ||
  mongoose.model<IMemberApplication, IMemberApplicationModel>('MemberApplication', memberApplicationSchema);


