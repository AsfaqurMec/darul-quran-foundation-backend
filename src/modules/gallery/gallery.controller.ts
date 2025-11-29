import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { galleryService } from './gallery.service';
import { ApiError } from '../common/middleware/error.middleware';
import { HTTP_STATUS } from '../../constants';
import { asyncHandler } from '../common/middleware/async.handler';
import { getFileUrl } from '../uploads/upload.middleware';

export class GalleryController {
  /**
   * Get all gallery items
   * GET /api/gallery
   */
  getAllGalleryItems = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { category, type } = req.query as { category?: string; type?: 'image' | 'video' };

    const galleryItems = await galleryService.getAllGalleryItems({
      ...(category ? { category } : {}),
      ...(type === 'image' || type === 'video' ? { type } : {}),
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: galleryItems.map((item) => ({
        id: item.id,
        title: item.title,
        media: item.media,
        category: item.category,
        type: item.type,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    });
  });

  /**
   * Get single gallery item
   * GET /api/gallery/:id
   */
  getGalleryItemById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const galleryItem = await galleryService.getGalleryItemById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: galleryItem.id,
        title: galleryItem.title,
        media: galleryItem.media,
        category: galleryItem.category,
        type: galleryItem.type,
        createdAt: galleryItem.createdAt,
        updatedAt: galleryItem.updatedAt,
      },
    });
  });

  /**
   * Create new gallery item
   * POST /api/gallery
   */
  createGalleryItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Debug: log incoming data to help verify what frontend sends
    try {
      const filesAny: any = (req as any).files;
      const debugFile = (f?: Express.Multer.File) =>
        f
          ? {
              fieldname: f.fieldname,
              originalname: f.originalname,
              mimetype: f.mimetype,
              size: f.size,
              filename: (f as any).filename,
            }
          : undefined;

      // eslint-disable-next-line no-console
      // console.log('[Gallery][POST] Incoming payload debug', {
      //   headers: { 'content-type': req.headers['content-type'] },
      //   bodyKeys: Object.keys(req.body || {}),
      //   body: req.body,
      //   hasSingleFile: Boolean((req as any).file),
      //   singleFile: debugFile((req as any).file),
      //   filesKeys: filesAny ? Object.keys(filesAny) : [],
      //   files: {
      //     media: Array.isArray(filesAny?.media) ? filesAny.media.map(debugFile) : undefined,
      //     image: Array.isArray(filesAny?.image) ? filesAny.image.map(debugFile) : undefined,
      //   },
      // });
    } catch {
      // ignore debug failures
    }

    const { title, media, category, type } = req.body;
    const isImageType = type === 'image';

    // Support both single and fields-based multer
    const files: any = (req as any).files;
    const uploadedFile: Express.Multer.File | undefined =
      (req as any).file || files?.media?.[0] || files?.image?.[0];

    if (isImageType && !uploadedFile) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Image file is required for gallery images');
    }

    if (!isImageType && uploadedFile) {
      // Clean up uploaded file if type mismatch
      if (uploadedFile.path) {
        fs.unlink(uploadedFile.path, () => undefined);
      }
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Video items must provide a media URL instead of a file');
    }

    if (!isImageType && !media) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Media URL is required for video items');
    }

    const mediaUrl = isImageType && uploadedFile ? getFileUrl(uploadedFile.filename) : media;

    const galleryItem = await galleryService.createGalleryItem({
      title,
      media: mediaUrl!,
      category,
      type,
    });

    if (!galleryItem) {
      throw new ApiError(HTTP_STATUS.INTERNAL_ERROR, 'Failed to create gallery item');
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        id: galleryItem.id,
        title: galleryItem.title,
        media: galleryItem.media,
        category: galleryItem.category,
        type: galleryItem.type,
        createdAt: galleryItem.createdAt,
        updatedAt: galleryItem.updatedAt,
      },
    });
  });

  /**
   * Update gallery item
   * PUT /api/gallery/:id
   */
  updateGalleryItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, media, category, type } = req.body;

    // Support both single and fields-based multer
    const files: any = (req as any).files;
    const uploadedFile: Express.Multer.File | undefined =
      (req as any).file || files?.media?.[0] || files?.image?.[0];

    const typeToUse = (type as 'image' | 'video' | undefined) ?? (uploadedFile ? 'image' : undefined);
    let mediaUrl: string | undefined;

    if (typeToUse === 'video') {
      if (uploadedFile && uploadedFile.path) {
        fs.unlink(uploadedFile.path, () => undefined);
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Video items must provide a media URL instead of a file');
      }
      if (typeof media === 'string' && media.trim().length > 0) {
        mediaUrl = media;
      }
    } else {
      if (uploadedFile) {
        mediaUrl = getFileUrl(uploadedFile.filename);
      } else if (typeof media === 'string' && media.trim().length > 0) {
        mediaUrl = media;
      }
    }

    const galleryItem = await galleryService.updateGalleryItem(id, {
      ...(title && { title }),
      ...(mediaUrl && { media: mediaUrl }),
      ...(category && { category }),
      ...(type && { type }),
    });

    if (!galleryItem) {
      throw new ApiError(HTTP_STATUS.INTERNAL_ERROR, 'Failed to update gallery item');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: galleryItem.id,
        title: galleryItem.title,
        media: galleryItem.media,
        category: galleryItem.category,
        type: galleryItem.type,
        createdAt: galleryItem.createdAt,
        updatedAt: galleryItem.updatedAt,
      },
    });
  });

  /**
   * Delete gallery item
   * DELETE /api/gallery/:id
   */
  deleteGalleryItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await galleryService.deleteGalleryItem(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Gallery item deleted successfully',
    });
  });
}

export const galleryController = new GalleryController();

