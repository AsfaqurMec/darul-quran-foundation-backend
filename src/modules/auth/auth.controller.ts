import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { ApiError } from '../common/middleware/error.middleware';
import { HTTP_STATUS } from '../../constants';
import { asyncHandler } from '../common/middleware/async.handler';
import { config } from '../../config';
import { userService } from '../users/user.service';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../common/utils/email';
import { hashPassword } from '../common/utils/hash';
import { User } from '../users/user.model';

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
      success: true,
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
      success: true,
      message: 'Login successful',
      data: {
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
      success: true,
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
      success: true,
      message: 'Logged out successfully',
    });
  });

  /**
   * Change password (per spec under /auth)
   * POST /api/auth/change-password
   */
  changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated');
    }

    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    await userService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password changed',
    });
  });

  /**
   * Forgot password (send reset link)
   * POST /api/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, callbackUrl } = req.body as { email: string; callbackUrl: string };

    try {
      const user = await userService.findByIdentifier(email);

      if (user?.email) {
        // Create a short-lived reset token signed with access secret
        const token = jwt.sign(
          { sub: user.id, kind: 'reset' },
          config.jwt.accessSecret,
          { expiresIn: '15m' }
        );

        const resetUrl = `${callbackUrl}/reset-password?token=${encodeURIComponent(token)}`;

        // Send email (logs to console if SMTP not configured)
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .button-container { text-align: center; margin: 30px 0; }
              .button { display: inline-block; padding: 14px 32px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; }
              .button:hover { background-color: #45a049; }
              .info-box { background-color: #fff; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .link-fallback { color: #666; font-size: 12px; margin-top: 15px; word-break: break-all; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>DarulQuran</h1>
              </div>
              <div class="content">
                <p>Dear User,</p>
                <p>We received a request to reset your password for your DarulQuran account.</p>
                <p>Click the button below to reset your password:</p>
                <div class="button-container">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <div class="info-box">
                  <p style="margin: 0;"><strong>Important:</strong> This link will expire in 15 minutes for security reasons.</p>
                </div>
                <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
                <p>For security reasons, if you continue to receive these emails, please contact our support team.</p>
                <p>Best regards,<br>DarulQuran Team</p>
                <div class="link-fallback">
                  <p style="margin: 5px 0;">If the button doesn't work, copy and paste this link into your browser:</p>
                  <p style="margin: 5px 0;">${resetUrl}</p>
                </div>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const text = `
DarulQuran - Password Reset Request

Dear User,

We received a request to reset your password for your DarulQuran account.

Reset your password using this link (expires in 15 minutes):
${resetUrl}

Important: This link will expire in 15 minutes for security reasons.

If you did not request a password reset, please ignore this email. Your password will remain unchanged.

For security reasons, if you continue to receive these emails, please contact our support team.

Best regards,
DarulQuran Team

---
This is an automated email. Please do not reply to this message.
        `;

        await sendEmail({
          to: user.email,
          subject: 'DarulQuran - Password Reset Request',
          html,
          text,
        });
      }
    } catch {
      // Intentionally swallow errors to avoid user enumeration
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'If an account exists, a reset link was sent',
    });
  });

  /**
   * Reset password with token (from body)
   * POST /api/auth/reset-password
   */
  resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token, newPassword } = req.body as { token: string; newPassword: string };

    try {
      const payload = jwt.verify(token, config.jwt.accessSecret) as any;
      if (!payload || payload.kind !== 'reset' || !payload.sub) {
        throw new Error('Invalid token');
      }

      const user = await User.findById(payload.sub).select('+passwordHash');
      if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
      }

      user.passwordHash = await hashPassword(newPassword);
      await user.save();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid or expired token');
    }
  });
}

export const authController = new AuthController();

