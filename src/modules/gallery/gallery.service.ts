import { GalleryItem, IGalleryItem } from './gallery.model';
import { ApiError } from '../common/middleware/error.middleware';
import { HTTP_STATUS } from '../../constants';

export class GalleryService {
  /**
   * Create a new gallery item
   */
  async createGalleryItem(input: {
    title: string;
    media: string;
    category: string;
    type: 'image' | 'video';
  }): Promise<IGalleryItem> {
    const galleryItem = await GalleryItem.create(input);
    return galleryItem;
  }

  /**
   * Get all gallery items
   */
  async getAllGalleryItems(filters?: {
    category?: string;
    type?: 'image' | 'video';
  }): Promise<IGalleryItem[]> {
    const query: Record<string, unknown> = {};

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.type) {
      query.type = filters.type;
    }

    return GalleryItem.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get gallery item by ID
   */
  async getGalleryItemById(id: string): Promise<IGalleryItem> {
    const galleryItem = await GalleryItem.findById(id);
    if (!galleryItem) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Gallery item not found');
    }
    return galleryItem;
  }

  /**
   * Update gallery item
   */
  async updateGalleryItem(
    id: string,
    updates: Partial<{
      title: string;
      media: string;
      category: string;
      type: 'image' | 'video';
    }>
  ): Promise<IGalleryItem> {
    const galleryItem = await GalleryItem.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!galleryItem) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Gallery item not found');
    }

    return galleryItem;
  }

  /**
   * Delete gallery item
   */
  async deleteGalleryItem(id: string): Promise<void> {
    const galleryItem = await GalleryItem.findByIdAndDelete(id);
    if (!galleryItem) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Gallery item not found');
    }
  }
}

export const galleryService = new GalleryService();

