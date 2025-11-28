import { HeroImage, IHeroImage } from './hero-image.model';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';

export class HeroImageService {
  /**
   * Create a new hero image
   */
  async createHeroImage(input: {
    image: string;
    title?: string;
    description?: string;
    order?: number;
    isActive?: boolean;
  }): Promise<IHeroImage> {
    const heroImage = await HeroImage.create(input);
    return heroImage;
  }

  /**
   * Get all hero images (optionally filtered by isActive)
   */
  async getAllHeroImages(isActive?: boolean): Promise<IHeroImage[]> {
    const query = isActive !== undefined ? { isActive } : {};
    return HeroImage.find(query).sort({ order: 1, createdAt: -1 });
  }

  /**
   * Get hero image by ID
   */
  async getHeroImageById(id: string): Promise<IHeroImage> {
    const heroImage = await HeroImage.findById(id);
    if (!heroImage) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Hero image not found');
    }
    return heroImage;
  }

  /**
   * Update hero image
   */
  async updateHeroImage(
    id: string,
    updates: Partial<{
      image: string;
      title: string;
      description: string;
      order: number;
      isActive: boolean;
    }>
  ): Promise<IHeroImage> {
    const heroImage = await HeroImage.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!heroImage) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Hero image not found');
    }

    return heroImage;
  }

  /**
   * Delete hero image
   */
  async deleteHeroImage(id: string): Promise<void> {
    const heroImage = await HeroImage.findByIdAndDelete(id);
    if (!heroImage) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Hero image not found');
    }
  }
}

export const heroImageService = new HeroImageService();

