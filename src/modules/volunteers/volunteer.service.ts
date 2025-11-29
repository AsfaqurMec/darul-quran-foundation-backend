import { FilterQuery } from 'mongoose';
import { VolunteerApplication, IVolunteerApplication } from './volunteer.model';
import { ApiError } from '../common/middleware/error.middleware';
import { HTTP_STATUS } from '../../constants';

export interface VolunteerFilters {
  status?: 'pending' | 'approved' | 'rejected';
  searchTerm?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export class VolunteerService {
  /**
   * Create a new volunteer application
   */
  async createVolunteerApplication(input: {
    name: string;
    fatherName: string;
    mobileNumber: string;
    mobileCountryCode: string;
    email: string;
    currentProfession: string;
    organizationName: string;
    workplaceAddress: string;
    currentDivision: string;
    currentDistrict: string;
    currentUpazila: string;
    currentUnion: string;
    currentFullAddress: string;
    permanentDivision: string;
    permanentDistrict: string;
    permanentUpazila: string;
    permanentUnion: string;
    permanentFullAddress: string;
    overseasCountry?: string | null;
    overseasAddress?: string | null;
    facebookId?: string | null;
    linkedinId?: string | null;
    whatsappNumber?: string | null;
    whatsappCountryCode?: string;
    telegramNumber?: string | null;
    telegramCountryCode?: string;
    fbNotUsed: boolean;
    educationMedium: string;
    educationLevel: string;
    currentClassYear: string;
    departmentDegree?: string | null;
    lastInstitutionName: string;
    wasVolunteer: boolean;
    previousProjectName?: string | null;
    previousProjectLocation?: string | null;
    previousBatch?: string | null;
    previousBeneficiariesCount?: number | null;
    profileImage?: string | null;
    status?: 'pending' | 'approved' | 'rejected';
  }): Promise<IVolunteerApplication> {
    const volunteer = await VolunteerApplication.create({
      ...input,
      status: input.status || 'pending',
      mobileCountryCode: input.mobileCountryCode || '+880',
      whatsappCountryCode: input.whatsappCountryCode || '+880',
      telegramCountryCode: input.telegramCountryCode || '+880',
    });

    return volunteer;
  }

  /**
   * Get all volunteer applications with optional filters and pagination
   */
  async getAllVolunteerApplications(
    filters?: VolunteerFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<IVolunteerApplication>> {
    const query: FilterQuery<IVolunteerApplication> = {};

    // Status filter
    if (filters?.status) {
      query.status = filters.status;
    }

    // Search filter
    if (filters?.searchTerm) {
      query.$or = [
        { name: { $regex: filters.searchTerm, $options: 'i' } },
        { email: { $regex: filters.searchTerm, $options: 'i' } },
        { mobileNumber: { $regex: filters.searchTerm, $options: 'i' } },
      ];
    }

    const total = await VolunteerApplication.countDocuments(query);

    // Default pagination
    const page = pagination?.page || 1;
    const limit = Math.min(pagination?.limit || 10, 100); // Max 100 items per page
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = pagination?.sort || 'createdAt';
    const sortOrder = pagination?.order === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

    const data = await VolunteerApplication.find(query).sort(sort).skip(skip).limit(limit);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Get volunteer application by ID
   */
  async getVolunteerApplicationById(id: string): Promise<IVolunteerApplication> {
    const volunteer = await VolunteerApplication.findById(id);
    if (!volunteer) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer application not found');
    }
    return volunteer;
  }

  /**
   * Update volunteer application status
   */
  async updateVolunteerApplicationStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<IVolunteerApplication> {
    const volunteer = await VolunteerApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!volunteer) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer application not found');
    }

    return volunteer;
  }

  /**
   * Delete volunteer application
   */
  async deleteVolunteerApplication(id: string): Promise<void> {
    const volunteer = await VolunteerApplication.findByIdAndDelete(id);
    if (!volunteer) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer application not found');
    }
  }
}

export const volunteerService = new VolunteerService();

