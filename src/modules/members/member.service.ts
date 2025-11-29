import axios from 'axios';
import crypto from 'crypto';
import { FilterQuery } from 'mongoose';
import { MemberApplication, IMemberApplication } from './member.model';
import { MemberPaymentSession } from './member-payment-session.model';
import {
  CompleteMemberPaymentInput,
  InitiateMemberPaymentInput,
  SubmitMemberApplicationInput,
} from './member.schema';
import { config } from '../../config';
import { ApiError } from '../common/middleware/error.middleware';
import { HTTP_STATUS } from '../../constants';
import { logger } from '../common/utils/logger';
import { sendMemberApplicationStatusEmail } from '../common/utils/email';

export interface MemberApplicationFilters {
  applicationStatus?: 'pending_approval' | 'approved' | 'rejected';
  paymentStatus?: 'pending' | 'completed' | 'pending_verification' | 'failed';
  type?: 'lifetime' | 'donor';
  searchTerm?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedMemberApplications {
  data: IMemberApplication[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface SSLGatewayResponse {
  status?: string;
  failedreason?: string;
  error?: string;
  GatewayPageURL?: string;
  sessionkey?: string;
  [key: string]: unknown;
}

interface SSLValidationResponse {
  status?: string;
  tran_id?: string;
  amount?: string | number;
  currency?: string;
  [key: string]: unknown;
}

export class MemberService {
  async getMemberApplications(
    filters: MemberApplicationFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedMemberApplications> {
    const query: FilterQuery<IMemberApplication> = {};

    if (filters.applicationStatus) {
      query.applicationStatus = filters.applicationStatus;
    }

    if (filters.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.searchTerm) {
      const searchRegex = { $regex: filters.searchTerm, $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
        { transactionId: searchRegex },
      ];
    }

    const totalItems = await MemberApplication.countDocuments(query);
    const page = pagination.page && pagination.page > 0 ? pagination.page : 1;
    const limit = pagination.limit && pagination.limit > 0 ? Math.min(pagination.limit, 100) : 10;
    const skip = (page - 1) * limit;

    const applications = await MemberApplication.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    return {
      data: applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit) || 1,
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  async getMemberApplicationById(id: string): Promise<IMemberApplication> {
    const application = await MemberApplication.findById(id);
    if (!application) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Member application not found');
    }
    return application;
  }

  async initiateOnlinePayment(input: InitiateMemberPaymentInput): Promise<IMemberApplication> {
   
    const member = await MemberApplication.create(input);
    return member
  }
  async completeOnlinePayment(input: CompleteMemberPaymentInput): Promise<IMemberApplication> {
    const session = await MemberPaymentSession.findOne({ transactionId: input.transactionId });
    if (!session) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Transaction not found');
    }

    if (session.status === 'completed') {
      const existing = await MemberApplication.findOne({ transactionId: input.transactionId });
      if (existing) {
        return existing;
      }
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Transaction already processed');
    }

    let validationData: SSLValidationResponse;
    try {
      const { data } = await axios.get<SSLValidationResponse>(config.sslcommerz.endpoints.validate, {
        params: {
          val_id: input.valId,
          store_id: config.sslcommerz.storeId,
          store_passwd: config.sslcommerz.storePassword,
          format: 'json',
        },
        timeout: 15000,
      });
      validationData = data;
    } catch (error) {
      logger.error('SSLCommerz validation failed', error);
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Unable to validate transaction with SSLCommerz');
    }

    const validationStatus = validationData?.status;
    if (!validationStatus || !['VALID', 'VALIDATED'].includes(validationStatus)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Transaction could not be validated');
    }

    if (validationData.tran_id !== input.transactionId) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Transaction ID mismatch');
    }

    const paidAmount = Number(validationData.amount);
    if (Number.isNaN(paidAmount) || Math.abs(paidAmount - session.formData.amount) > 1) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Paid amount does not match application amount');
    }

    const application = await MemberApplication.create({
      ...session.formData,
      paymentMethod: 'online',
      transactionId: input.transactionId,
      paymentStatus: 'completed',
      applicationStatus: 'pending_approval',
      sslcommerzValId: input.valId,
      sslcommerzData: validationData,
    });

    session.status = 'completed';
    session.sslValidationData = validationData;
    await session.save();

    return application;
  }

  async submitBankApplication(
    input: SubmitMemberApplicationInput,
    paymentDocumentUrl: string
  ): Promise<IMemberApplication> {
    if (!paymentDocumentUrl) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Payment document is required');
    }

    const application = await MemberApplication.create({
      ...input,
      paymentMethod: input.paymentMethod,
      paymentDocumentUrl,
      paymentStatus: 'pending_verification',
      applicationStatus: 'pending_approval',
    });

    return application;
  }

  async updateMember(
    tran_id: string,
    updates: Partial<{
      
      paymentStatus: string;
      
    }>
  ): Promise<any> {
    // Find by tran_id field (not _id) since SSLCommerz sends tran_id in callbacks
    const member = await MemberApplication.findOneAndUpdate(
      { tran_id: tran_id },
      updates,
      { new: true, runValidators: true }
    );

    if (!member) {
      logger.error(`member not found with tran_id: ${tran_id}`);
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `member not found with transaction ID: ${tran_id}`);
    }

    return member;
  }

  async updateMemberApplicationStatus(
    id: string,
    status: 'pending_approval' | 'approved' | 'rejected'
  ): Promise<IMemberApplication> {
    // Get the current application to check if status changed
    const currentApplication = await MemberApplication.findById(id);
    if (!currentApplication) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Member application not found');
    }

    const application = await MemberApplication.findByIdAndUpdate(
      id,
      { applicationStatus: status },
      { new: true, runValidators: true }
    );

    if (!application) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Member application not found');
    }

    // Send email notification if status changed and email exists
    if (
      application.email &&
      currentApplication.applicationStatus !== status
    ) {
      try {
        await sendMemberApplicationStatusEmail(
          application.email,
          application.name,
          'application',
          status,
          {
            type: application.type,
            amount: application.amount,
            transactionId: application.transactionId,
          }
        );
      } catch (error) {
        // Log error but don't fail the update
        logger.error('Failed to send application status email:', {
          applicationId: id,
          email: application.email,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return application;
  }
  async updateMemberApplicationPaymentStatus(
    id: string,
    paymentStatus: 'pending' | 'completed' | 'cancel' | 'failed' | 'pending_verification'
  ): Promise<IMemberApplication> {
    // Get the current application to check if status changed
    const currentApplication = await MemberApplication.findById(id);
    if (!currentApplication) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Member application not found');
    }

    const application = await MemberApplication.findByIdAndUpdate(
      id,
      { paymentStatus: paymentStatus },
      { new: true, runValidators: true }
    );
    if (!application) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Member application not found');
    }

    // Send email notification if status changed and email exists
    if (
      application.email &&
      currentApplication.paymentStatus !== paymentStatus
    ) {
      try {
        await sendMemberApplicationStatusEmail(
          application.email,
          application.name,
          'payment',
          paymentStatus,
          {
            type: application.type,
            amount: application.amount,
            transactionId: application.transactionId,
          }
        );
      } catch (error) {
        // Log error but don't fail the update
        logger.error('Failed to send payment status email:', {
          applicationId: id,
          email: application.email,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return application;
  } 

  async deleteMemberApplication(id: string): Promise<IMemberApplication> {
    const application = await MemberApplication.findById(id);
    if (!application) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Member application not found');
    }

    if (application.applicationStatus === 'approved') {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Cannot delete approved applications. Please reject the application instead.'
      );
    }

    await application.deleteOne();
    return application;
  }

  private generateTransactionId(): string {
    const uuid = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    return `MEM-${Date.now()}-${uuid.replace(/-/g, '').slice(0, 12)}`;
  }
}

export const memberService = new MemberService();


