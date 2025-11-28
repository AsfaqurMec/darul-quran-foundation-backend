import { FilterQuery } from 'mongoose';
import { DonationCategory, IDonationCategory } from './donation-category.model';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';
import { generateSlug } from './donation-category.schema';

export class DonationCategoryService {
  /**
   * Generate unique slug from title
   */
  private async generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const query: FilterQuery<IDonationCategory> = { slug };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const existing = await DonationCategory.findOne(query);
      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Create a new donation category
   */
  async createDonationCategory(input: {
    title: string;
    subtitle: string;
    video: string;
    description: string;
    slug?: string;
    expenseCategory: string[];
    thumbnail: string;
    daily?: number[] | null;
    monthly?: number[] | null;
    amount?: number[] | null;
    formTitle: string;
    formDescription: string;
  }): Promise<IDonationCategory> {
    // Generate slug if not provided
    let slug = input.slug || generateSlug(input.title);
    slug = await this.generateUniqueSlug(slug);

    // Validate at least one amount field
    const hasDaily = input.daily && Array.isArray(input.daily) && input.daily.length > 0;
    const hasMonthly = input.monthly && Array.isArray(input.monthly) && input.monthly.length > 0;
    const hasAmount = input.amount && Array.isArray(input.amount) && input.amount.length > 0;

    if (!hasDaily && !hasMonthly && !hasAmount) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'At least one of daily, monthly, or amount must be provided');
    }

    const donationCategory = await DonationCategory.create({
      ...input,
      slug,
      daily: input.daily && input.daily.length > 0 ? input.daily : undefined,
      monthly: input.monthly && input.monthly.length > 0 ? input.monthly : undefined,
      amount: input.amount && input.amount.length > 0 ? input.amount : undefined,
    });

    return donationCategory;
  }

  /**
   * Get all donation categories
   */
  async getAllDonationCategories(): Promise<IDonationCategory[]> {
    return DonationCategory.find().sort({ createdAt: -1 });
  }

  /**
   * Get donation category by ID
   */
  async getDonationCategoryById(id: string): Promise<IDonationCategory> {
    const donationCategory = await DonationCategory.findById(id);
    if (!donationCategory) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Donation category not found');
    }
    return donationCategory;
  }

  /**
   * Get donation category by slug
   */
  async getDonationCategoryBySlug(slug: string): Promise<IDonationCategory> {
    const donationCategory = await DonationCategory.findOne({ slug });
    if (!donationCategory) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Donation category not found');
    }
    return donationCategory;
  }

  /**
   * Update donation category
   */
  async updateDonationCategory(
    id: string,
    input: {
      title?: string;
      subtitle?: string;
      video?: string;
      description?: string;
      slug?: string;
      expenseCategory?: string[];
      thumbnail?: string;
      daily?: number[] | null;
      monthly?: number[] | null;
      amount?: number[] | null;
      formTitle?: string;
      formDescription?: string;
    }
  ): Promise<IDonationCategory> {
    const donationCategory = await DonationCategory.findById(id);
    if (!donationCategory) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Donation category not found');
    }

    // Handle slug update
    if (input.slug !== undefined) {
      const newSlug = input.slug || generateSlug(input.title || donationCategory.title);
      const uniqueSlug = await this.generateUniqueSlug(newSlug, id);
      input.slug = uniqueSlug;
    } else if (input.title !== undefined && !input.slug) {
      // If title changed but slug not provided, regenerate slug
      const newSlug = generateSlug(input.title);
      const uniqueSlug = await this.generateUniqueSlug(newSlug, id);
      input.slug = uniqueSlug;
    }

    // Validate amount fields if any are being updated
    const hasDailyUpdate = input.daily !== undefined;
    const hasMonthlyUpdate = input.monthly !== undefined;
    const hasAmountUpdate = input.amount !== undefined;

    if (hasDailyUpdate || hasMonthlyUpdate || hasAmountUpdate) {
      const finalDaily = hasDailyUpdate ? input.daily : donationCategory.daily;
      const finalMonthly = hasMonthlyUpdate ? input.monthly : donationCategory.monthly;
      const finalAmount = hasAmountUpdate ? input.amount : donationCategory.amount;

      const hasDaily = finalDaily && Array.isArray(finalDaily) && finalDaily.length > 0;
      const hasMonthly = finalMonthly && Array.isArray(finalMonthly) && finalMonthly.length > 0;
      const hasAmount = finalAmount && Array.isArray(finalAmount) && finalAmount.length > 0;

      if (!hasDaily && !hasMonthly && !hasAmount) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'At least one of daily, monthly, or amount must be provided');
      }
    }

    // Prepare update object
    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.subtitle !== undefined) updateData.subtitle = input.subtitle;
    if (input.video !== undefined) updateData.video = input.video;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.expenseCategory !== undefined) updateData.expenseCategory = input.expenseCategory;
    if (input.thumbnail !== undefined) updateData.thumbnail = input.thumbnail;
    if (input.daily !== undefined) updateData.daily = input.daily && input.daily.length > 0 ? input.daily : undefined;
    if (input.monthly !== undefined)
      updateData.monthly = input.monthly && input.monthly.length > 0 ? input.monthly : undefined;
    if (input.amount !== undefined)
      updateData.amount = input.amount && input.amount.length > 0 ? input.amount : undefined;
    if (input.formTitle !== undefined) updateData.formTitle = input.formTitle;
    if (input.formDescription !== undefined) updateData.formDescription = input.formDescription;

    const updatedDonationCategory = await DonationCategory.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedDonationCategory) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Donation category not found');
    }

    return updatedDonationCategory;
  }

  /**
   * Delete donation category
   */
  async deleteDonationCategory(id: string): Promise<void> {
    const donationCategory = await DonationCategory.findByIdAndDelete(id);
    if (!donationCategory) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Donation category not found');
    }
  }
}

export const donationCategoryService = new DonationCategoryService();

