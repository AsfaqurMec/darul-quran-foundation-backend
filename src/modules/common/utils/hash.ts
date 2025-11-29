import bcrypt from 'bcrypt';
import { config } from '../../../config';

/**
 * Hash a plain text password
 */
export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, config.bcrypt.saltRounds);
};

/**
 * Compare plain password with hash
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Hash a refresh token before storing in DB
 * Note: In production, consider storing token hash in Redis for better performance
 */
export const hashToken = async (token: string): Promise<string> => {
  return bcrypt.hash(token, config.bcrypt.saltRounds);
};

/**
 * Compare token with stored hash
 */
export const compareToken = async (
  token: string,
  hashedToken: string
): Promise<boolean> => {
  return bcrypt.compare(token, hashedToken);
};

