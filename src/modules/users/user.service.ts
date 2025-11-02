import { User, IUser } from './user.model';
import { hashPassword, comparePassword, compareToken } from '@/modules/common/utils/hash';
import { ApiError } from '@/modules/common/middleware/error.middleware';
import { HTTP_STATUS } from '@/constants';
import { ROLES } from '@/constants';

export class UserService {
  /**
   * Create a new user
   */
  async createUser(
    name: string,
    email: string,
    password: string,
    role?: string
  ): Promise<IUser> {
    // Check if user already exists
    const existingUser = await User.findOne({ email }).select('+passwordHash');
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || ROLES.DONORS,
    });

    // Return user without password hash
    return user;
  }

  /**
   * Find user by email (including password hash for login)
   */
  async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    if (includePassword) {
      return User.findOne({ email }).select('+passwordHash +refreshTokenHash');
    }
    return User.findOne({ email });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<IUser[]> {
    return User.find().select('-passwordHash -refreshTokenHash').lean();
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    updates: Partial<{ name: string; email: string; role: string; avatar: string }>
  ): Promise<IUser | null> {
    // Check if email is being changed and if it's already taken
    if (updates.email) {
      const existingUser = await User.findOne({ email: updates.email });
      if (existingUser && existingUser.id !== id) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already taken');
      }
    }

    return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  }

  /**
   * Change user password
   */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(id).select('+passwordHash');
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Current password is incorrect');
    }

    // Hash and update password
    const newPasswordHash = await hashPassword(newPassword);
    user.passwordHash = newPasswordHash;
    await user.save();
  }

  /**
   * Update refresh token hash (for token rotation)
   */
  async updateRefreshTokenHash(userId: string, tokenHash: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: tokenHash });
  }

  /**
   * Clear refresh token hash (for logout)
   */
  async clearRefreshTokenHash(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: undefined });
  }

  /**
   * Verify refresh token hash matches stored hash
   */
  async verifyRefreshTokenHash(userId: string, token: string): Promise<boolean> {
    const user = await User.findById(userId).select('+refreshTokenHash');
    if (!user || !user.refreshTokenHash) {
      return false;
    }

    return compareToken(token, user.refreshTokenHash);
  }
}

export const userService = new UserService();

