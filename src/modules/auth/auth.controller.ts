import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';
import { asyncHandler } from '@/modules/common/middleware/async.handler';
import { config } from '@/config';

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.register(req.body);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/api/auth/refresh', // Only sent to refresh endpoint
    });

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.login(req.body);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/api/auth/refresh', // Only sent to refresh endpoint
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  });

  /**
   * Refresh access token
   * POST /api/auth/refresh
   * Note: Refresh token should come from httpOnly cookie, but also accepts Authorization header for SPA compatibility
   */
  refresh = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Try to get refresh token from cookie first, then from Authorization header (for SPA)
    const refreshToken =
      req.cookies?.refreshToken || req.headers.authorization?.replace('Bearer ', '');

    if (!refreshToken) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Refresh token required');
    }

    const result = await authService.refresh(refreshToken);

    // Set new refresh token as httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: {
        accessToken: result.accessToken,
      },
    });
  });

  /**
   * Logout user
   * POST /api/auth/logout
   */
  logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
    }

    await authService.logout(req.user.id);

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      path: '/api/auth/refresh',
    });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  });

  /**
   * Request password reset
   * POST /api/auth/password-reset
   * TODO: Implement email service integration
   */
  requestPasswordReset = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;
      // await authService.requestPasswordReset(email);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        message: 'Password reset email sent (not implemented)',
      });
    }
  );

  /**
   * Reset password with token
   * POST /api/auth/password-reset/:token
   * TODO: Implement token verification and password update
   */
  resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    // await authService.resetPassword(token, newPassword);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Password reset (not implemented)',
    });
  });
}

export const authController = new AuthController();

