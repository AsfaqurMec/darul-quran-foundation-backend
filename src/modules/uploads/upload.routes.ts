import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '@/modules/common/middleware/auth.middleware';
import { uploadSingle, getFileUrl } from './upload.middleware';
import { asyncHandler } from '@/modules/common/middleware/async.handler';
import { userService } from '@/modules/users/user.service';
import { HTTP_STATUS } from '@/constants';
import { Request, Response } from 'express';
import { config } from '@/config';

const router = Router();

/**
 * Upload avatar image
 * POST /api/uploads/avatar
 * Requires authentication
 * Stores image and updates user avatar URL
 */
router.post(
  '/avatar',
  authMiddleware,
  uploadSingle('avatar'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }

    if (!req.user) {
      // Delete uploaded file if user not authenticated
      fs.unlinkSync(req.file.path);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Not authenticated',
      });
    }

    // Get file URL
    const fileUrl = getFileUrl(req.file.filename);

    // Update user avatar
  //  await userService.updateUser(req.user.id, { avatar: fileUrl });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: {
        url: fileUrl,
        filename: req.file.filename,
      },
    });
  })
);

/**
 * Upload general image
 * POST /api/uploads/image
 * Requires authentication
 * Returns file URL for use in other modules
 */
router.post(
  '/image',
  authMiddleware,
  uploadSingle('image'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }

    const fileUrl = getFileUrl(req.file.filename);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: {
        url: fileUrl,
        filename: req.file.filename,
      },
    });
  })
);

/**
 * Serve uploaded files
 * GET /api/uploads/:filename
 * Serves files from uploads directory
 */
router.get('/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.resolve(process.cwd(), config.upload.dir, filename);

  // Security: Prevent directory traversal
  if (!filePath.startsWith(path.resolve(process.cwd(), config.upload.dir))) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      status: 'error',
      message: 'Invalid file path',
    });
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      status: 'error',
      message: 'File not found',
    });
  }

  // Send file
  res.sendFile(filePath);
});

export default router;

