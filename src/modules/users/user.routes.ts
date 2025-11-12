import { Router } from 'express';
import { userController } from './user.controller';
import { authMiddleware } from '@/modules/common/middleware/auth.middleware';
import { roleMiddleware } from '@/modules/common/middleware/role.middleware';
import { validate } from '@/modules/common/middleware/validate.middleware';
import { updateUserSchema, changePasswordSchema } from './user.schema';
import { ROLES } from '@/constants';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// Get current user profile
router.get('/me', userController.getMe);

// Update current user profile
router.patch('/me', validate(updateUserSchema), userController.updateMe);

// Change password
router.post('/me/change-password', validate(changePasswordSchema), userController.changePassword);

// Get all users (admin and editor only)
router.get('/', roleMiddleware(ROLES.ADMIN, ROLES.EDITOR), userController.getAllUsers);

export default router;

