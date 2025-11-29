import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { programService } from './program.service';
import { ApiError } from '../common/middleware/error.middleware';
import { HTTP_STATUS } from '../../constants';
import { asyncHandler } from '../common/middleware/async.handler';
import { getFileUrl } from '../uploads/upload.middleware';
import { config } from '../../config';

export class ProgramController {
  /**
   * Get all programs
   * GET /api/programs
   * Query params: page, limit, sort, order, search
   */
  getAllPrograms = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as 'asc' | 'desc') || 'desc';
    const search = req.query.search as string | undefined;

    const filters = {
      ...(search && { search }),
    };

    const result = await programService.getAllPrograms(filters, { page, limit, sort, order });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.data.map((program) => ({
        id: program.id,
        title: program.title,
        subtitle: program.subtitle,
        description: program.description,
        thumbnail: program.thumbnail,
        slug: program.slug,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
      })),
      pagination: result.pagination,
    });

 //   console.log(result);
    
  });

  /**
   * Get single program by ID
   * GET /api/programs/:id
   */
  getProgramById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const program = await programService.getProgramById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: program.id,
        title: program.title,
        subtitle: program.subtitle,
        thumbnail: program.thumbnail,
        video: program.video,
        description: program.description,
        media: program.media,
        slug: program.slug,
        area: program.area,
        duration: program.duration,
        beneficiary: program.beneficiary,
        expenseCategory: program.expenseCategory,
        projectGoalsAndObjectives: program.projectGoalsAndObjectives,
        activities: program.activities,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
      },
    });
  });

  /**
   * Get single program by slug
   * GET /api/programs/slug/:slug
   */
  getProgramBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;
    const program = await programService.getProgramBySlug(slug);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: program.id,
        title: program.title,
        subtitle: program.subtitle,
        thumbnail: program.thumbnail,
        video: program.video,
        description: program.description,
        media: program.media,
        slug: program.slug,
        area: program.area,
        duration: program.duration,
        beneficiary: program.beneficiary,
        expenseCategory: program.expenseCategory,
        projectGoalsAndObjectives: program.projectGoalsAndObjectives,
        activities: program.activities,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
      },
    });
  });

  /**
   * Create new program
   * POST /api/programs
   */
  createProgram = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {
      title,
      subtitle,
      video,
      description,
      slug,
      area,
      duration,
      beneficiary,
      expenseCategory,
      projectGoalsAndObjectives,
      activities,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Handle thumbnail file upload
    let thumbnailUrl: string | undefined;
    if (files?.thumbnail && files.thumbnail.length > 0) {
      thumbnailUrl = getFileUrl(files.thumbnail[0].filename);
    } else if (req.body.thumbnail && typeof req.body.thumbnail === 'string') {
      thumbnailUrl = req.body.thumbnail;
    } else {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Thumbnail is required (file or URL)');
    }

    // Handle media file uploads
    let mediaUrls: string[] = [];
    if (files?.media && files.media.length > 0) {
      mediaUrls = files.media.map((file) => getFileUrl(file.filename));
    } else if (req.body.media && Array.isArray(req.body.media)) {
      mediaUrls = req.body.media;
    }

    if (mediaUrls.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'At least one media image is required (files or URLs)');
    }

    const program = await programService.createProgram({
      title,
      subtitle,
      thumbnail: thumbnailUrl!,
      video,
      description, // Preserve line breaks
      media: mediaUrls,
      slug,
      area: area || null,
      duration: duration || null,
      beneficiary: beneficiary || [],
      expenseCategory: expenseCategory || [],
      projectGoalsAndObjectives: projectGoalsAndObjectives || [],
      activities: activities || [],
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        id: program.id,
        title: program.title,
        subtitle: program.subtitle,
        thumbnail: program.thumbnail,
        video: program.video,
        description: program.description,
        media: program.media,
        slug: program.slug,
        area: program.area,
        duration: program.duration,
        beneficiary: program.beneficiary,
        expenseCategory: program.expenseCategory,
        projectGoalsAndObjectives: program.projectGoalsAndObjectives,
        activities: program.activities,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
      },
    });
  });

  /**
   * Update program
   * PUT /api/programs/:id
   */
  updateProgram = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const {
      title,
      subtitle,
      video,
      description,
      slug,
      area,
      duration,
      beneficiary,
      expenseCategory,
      projectGoalsAndObjectives,
      activities,
      existingMedia,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Fetch existing to allow conditional updates
    const existingProgram = await programService.getProgramById(id);

    const updates: {
      title?: string;
      subtitle?: string;
      thumbnail?: string;
      video?: string;
      description?: string;
      media?: string[];
      slug?: string;
      area?: string | null;
      duration?: string | null;
      beneficiary?: string[];
      expenseCategory?: string[];
      projectGoalsAndObjectives?: string[];
      activities?: string[];
    } = {};

    // Normalize a URL to '/uploads/...' if it contains that segment
    const toUploadsPath = (url: string): string => {
      const idx = url.indexOf('/uploads/');
      return idx >= 0 ? url.slice(idx) : url;
    };

    if (title) updates.title = title;
    if (subtitle) updates.subtitle = subtitle;
    if (video) updates.video = video;
    if (description) updates.description = description;
    if (slug) updates.slug = slug;
    if (area !== undefined) updates.area = area || null;
    if (duration !== undefined) updates.duration = duration || null;
    if (beneficiary !== undefined) updates.beneficiary = beneficiary;
    if (expenseCategory !== undefined) updates.expenseCategory = expenseCategory;
    if (projectGoalsAndObjectives !== undefined) updates.projectGoalsAndObjectives = projectGoalsAndObjectives;
    if (activities !== undefined) updates.activities = activities;

    // Thumbnail: update only if a new file is uploaded (same behavior as blog PUT)
    if (files?.thumbnail && files.thumbnail.length > 0) {
      updates.thumbnail = getFileUrl(files.thumbnail[0].filename);
    }
    // If a string (URL) is provided in body, keep existing (no change) to match blog behavior

    // Media handling to mirror blog PUT:
    // - Keep-list comes from 'existingMedia' (array or stringified JSON)
    // - New uploads may arrive as 'media' or alias 'image'
    let mediaToKeep: string[] = [];

    if (Array.isArray(existingMedia)) {
      mediaToKeep = existingMedia.filter((u) => typeof u === 'string' && u.trim() !== '');
    } else if (typeof existingMedia === 'string') {
      try {
        const arr = JSON.parse(existingMedia);
        if (Array.isArray(arr)) {
          mediaToKeep = arr.filter((u) => typeof u === 'string' && u.trim() !== '');
        }
      } catch {
        // ignore malformed JSON
      }
    }

    // Normalize kept URLs to '/uploads/...'
    mediaToKeep = mediaToKeep.map((u) => toUploadsPath(u));

    // Collect new uploaded files (accept both 'media' and alias 'image')
    const uploadedMedia = (files?.media ?? []) as Express.Multer.File[];
    const uploadedAlias = (files?.image ?? []) as Express.Multer.File[];
    const allNewFiles = [...uploadedMedia, ...uploadedAlias];
    const uploadedUrls = allNewFiles.map((file) => getFileUrl(file.filename));

    // Apply final media list only if any signal is provided
    if (mediaToKeep.length > 0 || uploadedUrls.length > 0) {
      updates.media = [...mediaToKeep, ...uploadedUrls];
    }

    const program = await programService.updateProgram(id, updates);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: program.id,
        title: program.title,
        subtitle: program.subtitle,
        thumbnail: program.thumbnail,
        video: program.video,
        description: program.description,
        media: program.media,
        slug: program.slug,
        area: program.area,
        duration: program.duration,
        beneficiary: program.beneficiary,
        expenseCategory: program.expenseCategory,
        projectGoalsAndObjectives: program.projectGoalsAndObjectives,
        activities: program.activities,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
      },
    });
  });

  /**
   * Delete program
   * DELETE /api/programs/:id
   */
  deleteProgram = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Get program to delete associated files
    const program = await programService.getProgramById(id);

    // Delete thumbnail file
    if (program.thumbnail) {
      const thumbnailPath = program.thumbnail.replace('/api/uploads/', '').replace('/uploads/', '');
      const filePath = path.resolve(process.cwd(), config.upload.dir, thumbnailPath);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting thumbnail file:', err);
        });
      }
    }

    // Delete media files
    if (program.media && program.media.length > 0) {
      program.media.forEach((mediaUrl) => {
        const mediaPath = mediaUrl.replace('/api/uploads/', '').replace('/uploads/', '');
        const filePath = path.resolve(process.cwd(), config.upload.dir, mediaPath);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting media file:', err);
          });
        }
      });
    }

    await programService.deleteProgram(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Program deleted successfully',
    });
  });
}

export const programController = new ProgramController();

