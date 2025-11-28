import { Request, Response, NextFunction } from 'express';
import { blogService } from './blog.service';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';
import { asyncHandler } from '@/modules/common/middleware/async.handler';
import { getFileUrl } from '@/modules/uploads/upload.middleware';

export class BlogController {
  /**
   * Get all blogs
   * GET /api/blogs
   */
  getAllBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const blogs = await blogService.getAllBlogs();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: blogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        excerpt: blog.excerpt,
        date: blog.date,
        thumbnail: blog.thumbnail,
        images: blog.images,
        fullContent: blog.fullContent,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      })),
    });
  });

  /**
   * Get single blog
   * GET /api/blogs/:id
   */
  getBlogById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const blog = await blogService.getBlogById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: blog.id,
        title: blog.title,
        excerpt: blog.excerpt,
        date: blog.date,
        thumbnail: blog.thumbnail,
        images: blog.images,
        fullContent: blog.fullContent,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      },
    });
  });

  /**
   * Create new blog
   * POST /api/blogs
   */
  createBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { title, excerpt, date, thumbnail, images, fullContent } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Handle images file uploads
    let imageUrls: string[] = [];
    const uploadedImages =
      (files && (files as any).images ? (files as any).images : []) as Express.Multer.File[];
    const uploadedImageAlias =
      (files && (files as any).image ? (files as any).image : []) as Express.Multer.File[];

    const allUploads = [...uploadedImages, ...uploadedImageAlias];

    if (allUploads.length > 0) {
      imageUrls = allUploads.map((file) => getFileUrl(file.filename));
    } else if (images && Array.isArray(images)) {
      imageUrls = images;
    }

    if (imageUrls.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'At least one image is required (files)');
    }

    // Handle thumbnail file upload (fallback to first image if not provided)
    let thumbnailUrl: string | undefined;
    if (files?.thumbnail && files.thumbnail.length > 0) {
      thumbnailUrl = getFileUrl(files.thumbnail[0].filename);
    } else if (thumbnail && typeof thumbnail === 'string' && thumbnail.trim().length > 0) {
      thumbnailUrl = thumbnail;
    } else {
      // Fallback: use first image as thumbnail when not explicitly provided
      thumbnailUrl = imageUrls[0];
    }


    const blog = await blogService.createBlog({
      title,
      excerpt,
      date,
      thumbnail: thumbnailUrl,
      images: imageUrls,
      fullContent,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        id: blog.id,
        title: blog.title,
        excerpt: blog.excerpt,
        date: blog.date,
        thumbnail: blog.thumbnail,
        images: blog.images,
        fullContent: blog.fullContent,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      },
    });
  });

  /**
   * Update blog
   * PUT /api/blogs/:id
   */
  updateBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
   // console.log(req.body);
    const { id } = req.params;
    const { title, excerpt, date, thumbnail, existingImages, fullContent } = req.body as Record<string, any>;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  //  console.log(existingImages);
    // Normalize a URL to '/uploads/...' if it contains that segment
    const toUploadsPath = (url: string): string => {
      const idx = url.indexOf('/uploads/');
      return idx >= 0 ? url.slice(idx) : url;
    };

    const updates: {
      title?: string;
      excerpt?: string;
      date?: string;
      thumbnail?: string;
      images?: string[];
      fullContent?: string;
    } = {};

    if (title) updates.title = title;
    if (excerpt) updates.excerpt = excerpt;
    if (date) updates.date = date;
    if (fullContent) updates.fullContent = fullContent;

    // Handle thumbnail per contract: keep existing unless a new file is uploaded
    if (files?.thumbnail && files.thumbnail.length > 0) {
      updates.thumbnail = getFileUrl(files.thumbnail[0].filename);
    }

    // Images handling for PUT:
    // - Files-only: 'images' is an array of files (no JSON list in body)
    // - Keep-list comes from 'existingImages' (array or stringified JSON)
    let imagesToKeep: string[] = [];

    if (Array.isArray(existingImages)) {
      imagesToKeep = existingImages.filter((u) => typeof u === 'string' && u.trim() !== '');
    } else if (typeof existingImages === 'string') {
      try {
        const arr = JSON.parse(existingImages);
        if (Array.isArray(arr)) {
          imagesToKeep = arr.filter((u) => typeof u === 'string' && u.trim() !== '');
        }
      } catch {
        // ignore
      }
    }

    // Normalize kept URLs to '/uploads/...'
    imagesToKeep = imagesToKeep.map((u) => toUploadsPath(u));

    // New uploaded files (accept both 'images' and alias 'image')
    const uploadedImages = (files?.images ?? []) as Express.Multer.File[];
    const uploadedAlias = (files?.image ?? []) as Express.Multer.File[];
    const allNewFiles = [...uploadedImages, ...uploadedAlias];
    const uploadedUrls = allNewFiles.map((file) => getFileUrl(file.filename));

    // Final images per contract
    if (imagesToKeep.length > 0 || uploadedUrls.length > 0) {
      updates.images = [...imagesToKeep, ...uploadedUrls];
    }

    const blog = await blogService.updateBlog(id, updates);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: blog.id,
        title: blog.title,
        excerpt: blog.excerpt,
        date: blog.date,
        thumbnail: blog.thumbnail,
        images: blog.images,
        fullContent: blog.fullContent,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      },
    });
  });

  /**
   * Delete blog
   * DELETE /api/blogs/:id
   */
  deleteBlog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await blogService.deleteBlog(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  });
}

export const blogController = new BlogController();

