import { FilterQuery } from 'mongoose';
import { Donation, IDonation, DonationStatus, DonationPurpose } from './donation.model';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';
import { userService } from '@/modules/users/user.service';
import { sendPasswordEmail } from '@/modules/common/utils/email';
import { logger } from '@/modules/common/utils/logger';

export interface DonationFilters {
  status?: DonationStatus;
  tran_id?: string;
  purpose?: DonationPurpose;
  contact?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class DonationService {
  /**
   * Generate a simple, memorable password based on user contact
   */
  private generateRelevantPassword(contact: string): string {
    const digits = (contact.match(/\d/g) || []).join('');
    const lastDigits = digits.slice(-4) || `${Math.floor(1000 + Math.random() * 9000)}`;

    if (this.isEmail(contact)) {
      const localPart = contact.split('@')[0] || 'user';
      const lettersOnly = localPart.replace(/[^a-zA-Z]/g, '');
      const baseRaw = lettersOnly.length > 0 ? lettersOnly : 'user';
      const base = baseRaw.slice(0, 1).toUpperCase() + baseRaw.slice(1, 6).toLowerCase(); // 1-6 letters
      // Example: John1234!
      return `${base}${lastDigits}!`;
    }

    // Phone-based password: User + last 6 digits + !
    const phoneTail = digits.slice(-6) || lastDigits;
    return `User${phoneTail}!`;
  }

  /**
   * Check if contact is email or phone
   */
  private isEmail(contact: string): boolean {
    return /^\S+@\S+\.\S+$/.test(contact);
  }

  /**
   * Create a new donation and create user if doesn't exist
   */
  async createDonation(input: {
    name?: string;
    behalf?: string;
    tran_id: string;
    purpose: DonationPurpose;
    contact: string;
    amount: number;
  }): Promise<IDonation> {
    const donation = await Donation.create(input);

    // Check if user exists with this contact (email or phone)
    try {
      const existingUser = await userService.findByIdentifier(input.contact);
      
      if (!existingUser) {
        // User doesn't exist, create one
        const isEmailContact = this.isEmail(input.contact);
        const generatedPassword = this.generateRelevantPassword(input.contact);
        
        // Extract name from email or use default
        const fullName = isEmailContact
          ? input.contact.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
          : `User ${input.contact.slice(-4)}`; // Use last 4 digits for phone

        try {
          const newUser = await userService.createUser({
            fullName,
            ...(isEmailContact ? { email: input.contact.toLowerCase() } : { phone: input.contact }),
            password: generatedPassword,
            role: 'donors', // Default role for donation users
          });

          // Send password email (only if it's an email contact)
          if (isEmailContact) {
            try {
              await sendPasswordEmail(input.contact.toLowerCase(), generatedPassword, fullName);
              logger.info('Password email sent to new user', { email: input.contact });
            } catch (emailError) {
              // Log error but don't fail the donation creation
              logger.error('Failed to send password email', {
                error: emailError,
                email: input.contact,
              });
            }
          } else {
            // For phone numbers, log the password (in production, you might want to send SMS)
            logger.info('New user created with phone number', {
              phone: input.contact,
              password: generatedPassword,
              userId: newUser.id,
            });
            // TODO: Implement SMS sending for phone numbers
          }

          logger.info('User created for donation', {
            userId: newUser.id,
            contact: input.contact,
            donationId: donation.id,
          });
        } catch (userError) {
          // Log error but don't fail the donation creation
          logger.error('Failed to create user for donation', {
            error: userError,
            contact: input.contact,
            donationId: donation.id,
          });
        }
      } else {
        logger.info('User already exists for donation', {
          userId: existingUser.id,
          contact: input.contact,
          donationId: donation.id,
        });
      }
    } catch (error) {
      // Log error but don't fail the donation creation
      logger.error('Error checking/creating user for donation', {
        error,
        contact: input.contact,
        donationId: donation.id,
      });
    }

    return donation;
  }

  /**
   * Get all donations with optional filters and pagination
   */
  async getAllDonations(
    filters?: DonationFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<IDonation>> {
    const query: FilterQuery<IDonation> = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.tran_id) {
      query.tran_id = filters.tran_id;
    }

    if (filters?.purpose) {
      query.purpose = filters.purpose;
    }

    if (filters?.contact) {
      query.contact = filters.contact;
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    const total = await Donation.countDocuments(query);

    let donationsQuery = Donation.find(query).sort({ createdAt: -1 });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      donationsQuery = donationsQuery.skip(skip).limit(pagination.limit);
    }

    const data = await donationsQuery;

    const result: PaginatedResult<IDonation> = {
      data,
      pagination: pagination
        ? {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages: Math.ceil(total / pagination.limit),
          }
        : {
            page: 1,
            limit: total,
            total,
            totalPages: 1,
          },
    };

    return result;
  }

  /**
   * Get total donation amount with filters
   */
  async getTotalDonationAmount(filters?: DonationFilters): Promise<number> {
    const query: FilterQuery<IDonation> = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.tran_id) {
      query.tran_id = filters.tran_id;
    }

    if (filters?.purpose) {
      query.purpose = filters.purpose;
    }

    if (filters?.contact) {
      query.contact = filters.contact;
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    const result = await Donation.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalAmount : 0;
  }

  /**
   * Get donation by ID
   */
  async getDonationById(id: string): Promise<IDonation> {
    const donation = await Donation.findById(id);
    if (!donation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Donation not found');
    }
    return donation;
  }

  /**
   * Get donations for a list of contacts (email/phone), sorted desc by createdAt
   */
  async getDonationsByContacts(contacts: string[]): Promise<IDonation[]> {
    if (!contacts.length) return [];
    return Donation.find({ contact: { $in: contacts } }).sort({ createdAt: -1 });
  }

  /**
   * Update donation by tran_id (transaction ID from SSLCommerz)
   */
  async updateDonation(
    tran_id: string,
    updates: Partial<{
      purpose: DonationPurpose;
      contact: string;
      amount: number;
      status: DonationStatus;
      tran_id: string;
    }>
  ): Promise<IDonation> {
    // Find by tran_id field (not _id) since SSLCommerz sends tran_id in callbacks
    const donation = await Donation.findOneAndUpdate(
      { tran_id: tran_id },
      updates,
      { new: true, runValidators: true }
    );

    if (!donation) {
      logger.error(`Donation not found with tran_id: ${tran_id}`);
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Donation not found with transaction ID: ${tran_id}`);
    }

    return donation;
  }

  /**
   * Delete donation
   */
  async deleteDonation(id: string): Promise<void> {
    const donation = await Donation.findByIdAndDelete(id);
    if (!donation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Donation not found');
    }
  }

  async updateDonationStatus(id: string, status: DonationStatus) {
    return this.updateDonation(id, { status });
  }
  
}


export const donationService = new DonationService();

