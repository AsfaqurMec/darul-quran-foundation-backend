import { FilterQuery } from 'mongoose';
import { GalleryCategory, IGalleryCategory } from './gallery-category.model';
import { GalleryItem } from '../gallery/gallery.model';
import { ApiError } from '../common/middleware/error.middleware';
import { HTTP_STATUS } from '../../constants';

export class GalleryCategoryService {
  /**
   * Get all gallery categories with pagination and search
   */
  async getAllGalleryCategories(params: {
    page?: number;
    limit?: number;
    searchTerm?: string;
  }): Promise<{
    categories: IGalleryCategory[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  }> {
    const { page = 1, limit = 10, searchTerm } = params;
    const skip = (page - 1) * limit;

    const query: FilterQuery<IGalleryCategory> = {};
    if (searchTerm) {
      query.title = { $regex: searchTerm, $options: 'i' };
    }

    const [categories, totalItems] = await Promise.all([
      GalleryCategory.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      GalleryCategory.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      categories,
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
    };
  }

  /**
   * Get gallery category by ID
   */
  async getGalleryCategoryById(id: string): Promise<IGalleryCategory> {
    const category = await GalleryCategory.findById(id);
    if (!category) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
    }
    return category;
  }

  /**
   * Create a new gallery category
   */
  async createGalleryCategory(input: { title: string }): Promise<IGalleryCategory> {
    // Check for duplicate title
    const existing = await GalleryCategory.findOne({ title: input.title.trim() });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Category with this title already exists');
    }

    const category = await GalleryCategory.create({
      title: input.title.trim(),
    });

    return category;
  }

  /**
   * Update gallery category
   */
  async updateGalleryCategory(
    id: string,
    input: { title?: string }
  ): Promise<IGalleryCategory> {
    const category = await GalleryCategory.findById(id);
    if (!category) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
    }

    // Check for duplicate title (excluding current category)
    if (input.title !== undefined) {
      const trimmedTitle = input.title.trim();
      const existing = await GalleryCategory.findOne({
        title: trimmedTitle,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Category with this title already exists');
      }
    }

    const updateData: any = {};
    if (input.title !== undefined) {
      updateData.title = input.title.trim();
    }

    const updatedCategory = await GalleryCategory.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCategory) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
    }

    return updatedCategory;
  }

  /**
   * Delete gallery category
   * Checks if any gallery items are using this category before deletion
   */
  async deleteGalleryCategory(id: string): Promise<void> {
    const category = await GalleryCategory.findById(id);
    if (!category) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
    }

    // Check if any gallery items are using this category
    const galleryItemsCount = await GalleryItem.countDocuments({ category: category.title });
    if (galleryItemsCount > 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Cannot delete category: it is being used by ${galleryItemsCount} gallery item(s)`
      );
    }

    await GalleryCategory.findByIdAndDelete(id);
  }
}

export const galleryCategoryService = new GalleryCategoryService();

