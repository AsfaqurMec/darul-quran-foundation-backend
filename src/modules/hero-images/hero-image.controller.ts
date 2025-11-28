import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { heroImageService } from './hero-image.service';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';
import { asyncHandler } from '@/modules/common/middleware/async.handler';
import { getFileUrl } from '@/modules/uploads/upload.middleware';
import { config } from '@/config';

export class HeroImageController {
  /**
   * Get all hero images
   * GET /api/hero-images
   * Query params: ?isActive=true
   */
  getAllHeroImages = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

    const heroImages = await heroImageService.getAllHeroImages(isActive);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: heroImages.map((item) => ({
        id: item.id,
        image: item.image,
        title: item.title,
        description: item.description,
        order: item.order,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    });
  });

  /**
   * Get single hero image
   * GET /api/hero-images/:id
   */
  getHeroImageById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const heroImage = await heroImageService.getHeroImageById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: heroImage.id,
        image: heroImage.image,
        title: heroImage.title,
        description: heroImage.description,
        order: heroImage.order,
        isActive: heroImage.isActive,
        createdAt: heroImage.createdAt,
        updatedAt: heroImage.updatedAt,
      },
    });
  });

  /**
   * Create new hero image
   * POST /api/hero-images
   */
  createHeroImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, order, isActive } = req.body;
    const filesAny: any = (req as any).files;
    const file: Express.Multer.File | undefined =
      (req as any).file || filesAny?.image?.[0] || filesAny?.media?.[0];

    if (!file) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Image file is required');
    }

    const imageUrl = getFileUrl(file.filename);

    const heroImage = await heroImageService.createHeroImage({
      image: imageUrl,
      title: title || undefined,
      description: description || undefined,
      order: order ? parseInt(order, 10) : 0,
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        id: heroImage.id,
        image: heroImage.image,
        title: heroImage.title,
        description: heroImage.description,
        order: heroImage.order,
        isActive: heroImage.isActive,
        createdAt: heroImage.createdAt,
        updatedAt: heroImage.updatedAt,
      },
      message: 'Hero image created successfully',
    });
  });

  /**
   * Update hero image
   * PUT /api/hero-images/:id
   */
  updateHeroImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, description, order, isActive } = req.body;
    const filesAny: any = (req as any).files;
    const file: Express.Multer.File | undefined =
      (req as any).file || filesAny?.image?.[0] || filesAny?.media?.[0];

    // Get existing hero image to delete old file if new one is uploaded
    const existingHeroImage = await heroImageService.getHeroImageById(id);

    const updates: {
      image?: string;
      title?: string;
      description?: string;
      order?: number;
      isActive?: boolean;
    } = {};

    if (file) {
      // Delete old image file
      if (existingHeroImage.image) {
        // Handle both /api/uploads/ and /uploads/ paths
        const oldImagePath = existingHeroImage.image
          .replace('/api/uploads/', '')
          .replace('/uploads/', '');
        const filePath = path.resolve(process.cwd(), config.upload.dir, oldImagePath);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting old image:', err);
          });
        }
      }
      updates.image = getFileUrl(file.filename);
    }

    if (title !== undefined) updates.title = title || undefined;
    if (description !== undefined) updates.description = description || undefined;
    if (order !== undefined) updates.order = parseInt(order, 10);
    if (isActive !== undefined) updates.isActive = isActive === 'true' || isActive === true;

    const heroImage = await heroImageService.updateHeroImage(id, updates);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: heroImage.id,
        image: heroImage.image,
        title: heroImage.title,
        description: heroImage.description,
        order: heroImage.order,
        isActive: heroImage.isActive,
        createdAt: heroImage.createdAt,
        updatedAt: heroImage.updatedAt,
      },
      message: 'Hero image updated successfully',
    });
  });

  /**
   * Delete hero image
   * DELETE /api/hero-images/:id
   */
  deleteHeroImage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Get hero image to delete associated file
    const heroImage = await heroImageService.getHeroImageById(id);

    // Delete the image file
    if (heroImage.image) {
      const imagePath = heroImage.image.replace('/api/uploads/', '').replace('/uploads/', '');
      const filePath = path.resolve(process.cwd(), config.upload.dir, imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting image file:', err);
        });
      }
    }

    await heroImageService.deleteHeroImage(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Hero image deleted successfully',
    });
  });
}

export const heroImageController = new HeroImageController();

