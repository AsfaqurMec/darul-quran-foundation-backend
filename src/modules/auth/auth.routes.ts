import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '@/modules/common/middleware/validate.middleware';
import { registerSchema, loginSchema } from './auth.schema';
import { authMiddleware } from '@/modules/common/middleware/auth.middleware';

const router = Router();

// Register
router.post('/register', validate(registerSchema), authController.register);

// Login
router.post('/login', validate(loginSchema), authController.login);

// Refresh token
router.post('/refresh', authController.refresh);

// Logout (requires authentication)
router.post('/logout', authMiddleware, authController.logout);

// Password reset (TODO)
router.post('/password-reset', authController.requestPasswordReset);
router.post('/password-reset/:token', authController.resetPassword);

export default router;

