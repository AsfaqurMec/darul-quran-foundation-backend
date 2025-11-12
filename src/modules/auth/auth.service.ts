import { userService } from '@/modules/users/user.service';
import { comparePassword, hashToken } from '@/modules/common/utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/modules/common/utils/jwt';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';
import type { RegisterInput, LoginInput } from './auth.schema';

export class AuthService {
  /**
   * Register a new user
   * Creates user, generates tokens, and stores refresh token hash
   */
  async register(input: RegisterInput): Promise<{
    user: {
      id: string;
      fullName: string;
      email?: string;
      phone?: string;
      role: string;
      address?: string;
      pictures: string[];
    };
    accessToken: string;
    refreshToken: string;
  }> {
    const { fullName, email, phone, password, role, address, pictures } = input;

    // Create user
    const user = await userService.createUser({
      fullName,
      email,
      phone,
      password,
      role,
      address,
      pictures,
    });

    const identifier = user.email || user.phone || '';

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      identifier,
      email: user.email,
      phone: user.phone,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      role: user.role,
      identifier,
      email: user.email,
      phone: user.phone,
    });

    // Hash and store refresh token
    const refreshTokenHash = await hashToken(refreshToken);
    await userService.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        pictures: user.pictures || [],
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   * Verifies credentials, generates tokens, and stores refresh token hash
   */
  async login(input: LoginInput): Promise<{
    user: {
      id: string;
      fullName: string;
      email?: string;
      phone?: string;
      role: string;
      address?: string;
      pictures: string[];
    };
    accessToken: string;
    refreshToken: string;
  }> {
    const { identifier, password } = input;

    // Find user with password hash
    const user = await userService.findByIdentifier(identifier, true);
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    // Verify password
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
    }

    const resolvedIdentifier = user.email || user.phone || identifier;

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      identifier: resolvedIdentifier,
      email: user.email,
      phone: user.phone,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      role: user.role,
      identifier: resolvedIdentifier,
      email: user.email,
      phone: user.phone,
    });

    // Hash and store refresh token (token rotation)
    const refreshTokenHash = await hashToken(refreshToken);
    await userService.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        pictures: user.pictures || [],
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   * Validates refresh token, rotates tokens for security
   */
  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired refresh token');
    }

    // Verify refresh token hash matches stored hash
    const isValid = await userService.verifyRefreshTokenHash(payload.id, refreshToken);
    if (!isValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token');
    }

    // Get user to ensure they still exist
    const user = await userService.findById(payload.id);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Generate new tokens (token rotation)
    const newAccessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      identifier: payload.identifier || user.email || user.phone || '',
      email: user.email,
      phone: user.phone,
    });

    const newRefreshToken = generateRefreshToken({
      id: user.id,
      role: user.role,
      identifier: payload.identifier || user.email || user.phone || '',
      email: user.email,
      phone: user.phone,
    });

    // Store new refresh token hash
    const newRefreshTokenHash = await hashToken(newRefreshToken);
    await userService.updateRefreshTokenHash(user.id, newRefreshTokenHash);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user
   * Invalidates refresh token
   */
  async logout(userId: string): Promise<void> {
    await userService.clearRefreshTokenHash(userId);

    // TODO: In production, consider blacklisting tokens in Redis
    // for immediate invalidation across all servers in a distributed system
  }

  /**
   * Password reset request
   * TODO: Implement email service integration
   */
  async requestPasswordReset(email: string): Promise<void> {
    // TODO: Generate reset token, send email, store token hash with expiration
    throw new Error('Password reset not implemented');
  }

  /**
   * Reset password with token
   * TODO: Implement token verification and password update
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // TODO: Verify token, update password, clear token
    throw new Error('Password reset not implemented');
  }
}

export const authService = new AuthService();

