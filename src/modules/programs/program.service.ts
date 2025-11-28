import { FilterQuery } from 'mongoose';
import { Program, IProgram } from './program.model';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';
import { generateSlug } from './program.schema';

export interface ProgramFilters {
  search?: string;
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
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ProgramService {
  /**
   * Generate unique slug from title
   */
  private async generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const query: FilterQuery<IProgram> = { slug };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const existing = await Program.findOne(query);
      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Create a new program
   */
  async createProgram(input: {
    title: string;
    subtitle: string;
    thumbnail: string;
    video: string;
    description: string;
    media: string[];
    slug?: string;
    area?: string | null;
    duration?: string | null;
    beneficiary?: string[];
    expenseCategory?: string[];
    projectGoalsAndObjectives?: string[];
    activities?: string[];
  }): Promise<IProgram> {
    // Generate slug if not provided
    let slug = input.slug || generateSlug(input.title);
    slug = await this.generateUniqueSlug(slug);

    // Check if slug already exists
    const existingProgram = await Program.findOne({ slug });
    if (existingProgram) {
      slug = await this.generateUniqueSlug(slug);
    }

    const program = await Program.create({
      ...input,
      slug,
      beneficiary: input.beneficiary || [],
      expenseCategory: input.expenseCategory || [],
      projectGoalsAndObjectives: input.projectGoalsAndObjectives || [],
      activities: input.activities || [],
    });

    return program;
  }

  /**
   * Get all programs with optional filters and pagination
   */
  async getAllPrograms(
    filters?: ProgramFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<IProgram>> {
    const query: FilterQuery<IProgram> = {};

    // Search filter
    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { subtitle: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const total = await Program.countDocuments(query);

    // Default pagination
    const page = pagination?.page || 1;
    const limit = Math.min(pagination?.limit || 10, 100); // Max 100 items per page
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = pagination?.sort || 'createdAt';
    const sortOrder = pagination?.order === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

    const data = await Program.find(query)
      .select('id title subtitle thumbnail slug createdAt updatedAt description')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get program by ID
   */
  async getProgramById(id: string): Promise<IProgram> {
    const program = await Program.findById(id);
    if (!program) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Program not found');
    }
    return program;
  }

  /**
   * Get program by slug
   */
  async getProgramBySlug(slug: string): Promise<IProgram> {
    const program = await Program.findOne({ slug: slug.toLowerCase() });
    if (!program) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Program not found');
    }
    return program;
  }

  /**
   * Update program
   */
  async updateProgram(
    id: string,
    updates: Partial<{
      title: string;
      subtitle: string;
      thumbnail: string;
      video: string;
      description: string;
      media: string[];
      slug: string;
      area: string | null;
      duration: string | null;
      beneficiary: string[];
      expenseCategory: string[];
      projectGoalsAndObjectives: string[];
      activities: string[];
    }>
  ): Promise<IProgram> {
    // If slug is being updated, ensure it's unique
    if (updates.slug) {
      updates.slug = await this.generateUniqueSlug(updates.slug, id);
    }

    // If title is updated but slug is not, regenerate slug
    if (updates.title && !updates.slug) {
      const baseSlug = generateSlug(updates.title);
      updates.slug = await this.generateUniqueSlug(baseSlug, id);
    }

    const program = await Program.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!program) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Program not found');
    }

    return program;
  }

  /**
   * Delete program
   */
  async deleteProgram(id: string): Promise<void> {
    const program = await Program.findByIdAndDelete(id);
    if (!program) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Program not found');
    }
  }
}

export const programService = new ProgramService();

