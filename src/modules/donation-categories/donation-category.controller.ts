import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { donationCategoryService } from './donation-category.service';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';
import { asyncHandler } from '@/modules/common/middleware/async.handler';
import { getFileUrl } from '@/modules/uploads/upload.middleware';
import { config } from '@/config';

export class DonationCategoryController {
  /**
   * Get all donation categories
   * GET /api/donation-categories
   */
  getAllDonationCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const categories = await donationCategoryService.getAllDonationCategories();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: categories.map((category) => ({
        id: category.id,
        title: category.title,
        subtitle: category.subtitle,
        slug: category.slug,
        expenseCategory: category.expenseCategory,
        thumbnail: category.thumbnail,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })),
    });
  });

  /**
   * Get single donation category by ID
   * GET /api/donation-categories/:id
   */
  getDonationCategoryById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const category = await donationCategoryService.getDonationCategoryById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: category.id,
        title: category.title,
        subtitle: category.subtitle,
        video: category.video,
        description: category.description,
        slug: category.slug,
        expenseCategory: category.expenseCategory,
        thumbnail: category.thumbnail,
        daily: category.daily,
        monthly: category.monthly,
        amount: category.amount,
        formTitle: category.formTitle,
        formDescription: category.formDescription,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  });

  /**
   * Get single donation category by slug
   * GET /api/donation-categories/slug/:slug
   */
  getDonationCategoryBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;
    const category = await donationCategoryService.getDonationCategoryBySlug(slug);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: category.id,
        title: category.title,
        subtitle: category.subtitle,
        video: category.video,
        description: category.description,
        slug: category.slug,
        expenseCategory: category.expenseCategory,
        thumbnail: category.thumbnail,
        daily: category.daily,
        monthly: category.monthly,
        amount: category.amount,
        formTitle: category.formTitle,
        formDescription: category.formDescription,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  });

  /**
   * Create new donation category
   * POST /api/donation-categories
   */
  createDonationCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {
      title,
      subtitle,
      video,
      description,
      slug,
      expenseCategory,
      daily,
      monthly,
      amount,
      formTitle,
      formDescription,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Handle thumbnail file upload
    const uploadedThumb =
      (files && files.thumbnail && files.thumbnail[0]) ||
      (files && files.image && files.image[0]);
    if (!uploadedThumb) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Thumbnail is required as an uploaded file');
    }
    const thumbnailUrl = getFileUrl(uploadedThumb.filename);

    // Parse number arrays from strings if needed
    const parseNumberArray = (value: any): number[] | null => {
      if (!value) return null;
      if (Array.isArray(value)) {
        return value.map((n) => {
          const num = Number(n);
          if (isNaN(num) || num <= 0) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'All amounts must be positive numbers');
          }
          return num;
        });
      }
      return null;
    };

    const category = await donationCategoryService.createDonationCategory({
      title,
      subtitle,
      video,
      description, // Preserve line breaks
      slug,
      expenseCategory,
      thumbnail: thumbnailUrl,
      daily: parseNumberArray(daily),
      monthly: parseNumberArray(monthly),
      amount: parseNumberArray(amount),
      formTitle,
      formDescription,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        id: category.id,
        title: category.title,
        subtitle: category.subtitle,
        video: category.video,
        description: category.description,
        slug: category.slug,
        expenseCategory: category.expenseCategory,
        thumbnail: category.thumbnail,
        daily: category.daily,
        monthly: category.monthly,
        amount: category.amount,
        formTitle: category.formTitle,
        formDescription: category.formDescription,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  });

  /**
   * Update donation category
   * PUT /api/donation-categories/:id
   */
  updateDonationCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const {
      title,
      subtitle,
      video,
      description,
      slug,
      expenseCategory,
      daily,
      monthly,
      amount,
      formTitle,
      formDescription,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Get existing category to delete old files if new ones are uploaded
    const existingCategory = await donationCategoryService.getDonationCategoryById(id);

    const updates: {
      title?: string;
      subtitle?: string;
      video?: string;
      description?: string;
      slug?: string;
      expenseCategory?: string;
      thumbnail?: string;
      daily?: number[] | null;
      monthly?: number[] | null;
      amount?: number[] | null;
      formTitle?: string;
      formDescription?: string;
    } = {};

    if (title) updates.title = title;
    if (subtitle) updates.subtitle = subtitle;
    if (video) updates.video = video;
    if (description) updates.description = description; // Preserve line breaks
    if (slug) updates.slug = slug;
    if (expenseCategory) updates.expenseCategory = expenseCategory;
    if (formTitle) updates.formTitle = formTitle;
    if (formDescription) updates.formDescription = formDescription;

    // Handle thumbnail: only update if a new file is uploaded (mirror blog PUT behavior)
    if (files?.thumbnail && files.thumbnail.length > 0) {
      updates.thumbnail = getFileUrl(files.thumbnail[0].filename);
    }
    // If string (URL) is provided, don't update - keep existing value

    // Parse number arrays from strings if needed
    const parseNumberArray = (value: any): number[] | null => {
      if (value === undefined) return null;
      if (value === null) return null;
      if (Array.isArray(value)) {
        if (value.length === 0) return null;
        return value.map((n) => {
          const num = Number(n);
          if (isNaN(num) || num <= 0) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'All amounts must be positive numbers');
          }
          return num;
        });
      }
      return null;
    };

    if (daily !== undefined) updates.daily = parseNumberArray(daily);
    if (monthly !== undefined) updates.monthly = parseNumberArray(monthly);
    if (amount !== undefined) updates.amount = parseNumberArray(amount);

    const category = await donationCategoryService.updateDonationCategory(id, updates as any);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: category.id,
        title: category.title,
        subtitle: category.subtitle,
        video: category.video,
        description: category.description,
        slug: category.slug,
        expenseCategory: category.expenseCategory,
        thumbnail: category.thumbnail,
        daily: category.daily,
        monthly: category.monthly,
        amount: category.amount,
        formTitle: category.formTitle,
        formDescription: category.formDescription,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  });

  /**
   * Delete donation category
   * DELETE /api/donation-categories/:id
   */
  deleteDonationCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Get category to delete thumbnail file
    const category = await donationCategoryService.getDonationCategoryById(id);

    // Delete thumbnail file if it exists
    if (category.thumbnail) {
      const thumbnailPath = category.thumbnail.replace('/api/uploads/', '').replace('/uploads/', '');
      const filePath = path.resolve(process.cwd(), config.upload.dir, thumbnailPath);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting thumbnail file:', err);
        });
      }
    }

    await donationCategoryService.deleteDonationCategory(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Donation category deleted successfully',
    });
  });
}

export const donationCategoryController = new DonationCategoryController();

