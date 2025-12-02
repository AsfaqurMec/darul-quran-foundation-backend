import { Request, Response, NextFunction } from 'express';
import { galleryCategoryService } from './gallery-category.service';
import { HTTP_STATUS } from '../../constants';
import { asyncHandler } from '../common/middleware/async.handler';

export class GalleryCategoryController {
  /**
   * Get all gallery categories with pagination and search
   * GET /api/v1/gallery-category
   */
  getAllGalleryCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const searchTerm = req.query.searchTerm as string | undefined;

    const result = await galleryCategoryService.getAllGalleryCategories({
      page,
      limit,
      searchTerm,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.categories.map((category) => ({
        id: category.id,
        title: category.title,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })),
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        itemsPerPage: result.itemsPerPage,
      },
    });
  });

  /**
   * Get single gallery category by ID
   * GET /api/v1/gallery-category/:id
   */
  getGalleryCategoryById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const category = await galleryCategoryService.getGalleryCategoryById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: category.id,
        title: category.title,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  });

  /**
   * Create new gallery category
   * POST /api/v1/gallery-category
   */
  createGalleryCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { title } = req.body;

    const category = await galleryCategoryService.createGalleryCategory({ title });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        id: category.id,
        title: category.title,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
      message: 'Category created successfully',
    });
  });

  /**
   * Update gallery category
   * PUT /api/v1/gallery-category/:id
   */
  updateGalleryCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title } = req.body;

    const category = await galleryCategoryService.updateGalleryCategory(id, { title });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: category.id,
        title: category.title,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
      message: 'Category updated successfully',
    });
  });

  /**
   * Delete gallery category
   * DELETE /api/v1/gallery-category/:id
   */
  deleteGalleryCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await galleryCategoryService.deleteGalleryCategory(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: null,
      message: 'Category deleted successfully',
    });
  });
}

export const galleryCategoryController = new GalleryCategoryController();

