import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';
import { asyncHandler } from '@/modules/common/middleware/async.handler';

export class UserController {
  /**
   * Get current user profile
   * GET /api/users/me
   */
  getMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
    }

    const user = await userService.findById(req.user.id);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        pictures: user.pictures || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  });

  /**
   * Get all users (admin only)
   * GET /api/users
   */
  getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const users = await userService.getAllUsers();

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: users,
    });
  });

  /**
   * Update user profile
   * PATCH /api/users/me
   */
  updateMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
    }

    const { fullName, email, phone, address, pictures, avatar } = req.body;

    const user = await userService.updateUser(req.user.id, {
      ...(fullName && { fullName }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(Array.isArray(pictures) && { pictures }),
      ...(avatar && { avatar }),
    });

    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        pictures: user.pictures || [],
        updatedAt: user.updatedAt,
      },
    });
  });

  /**
   * Change password
   * POST /api/users/me/change-password
   */
  changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
    }

    const { currentPassword, newPassword } = req.body;

    await userService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  });
}

export const userController = new UserController();

