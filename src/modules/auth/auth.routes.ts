import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../common/middleware/validate.middleware';
import { registerSchema, loginSchema } from './auth.schema';
import { authMiddleware } from '../common/middleware/auth.middleware';

const router = Router();

// Register
router.post('/register', validate(registerSchema), authController.register);

// Login
router.post('/login', validate(loginSchema), authController.login);

// Refresh token
router.post('/refresh', authController.refresh);

// Logout (requires authentication)
router.post('/logout', authMiddleware, authController.logout);

// Change password (auth required)
router.post('/change-password', authMiddleware, authController.changePassword);

// Forgot/Reset password (per spec)
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;

