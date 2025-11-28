import { Router } from 'express';
import { userController } from './user.controller';
import { authMiddleware } from '@/modules/common/middleware/auth.middleware';
import { roleMiddleware } from '@/modules/common/middleware/role.middleware';
import { validate } from '@/modules/common/middleware/validate.middleware';
import {
  updateUserSchema,
  changePasswordSchema,
  createAdminSchema,
  updateUserAdminSchema,
  getUsersQuerySchema,
} from './user.schema';
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

// Admin-only routes
// Create admin/editor user
router.post(
  '/create-admin',
  roleMiddleware(ROLES.ADMIN),
  validate(createAdminSchema),
  userController.createAdmin
);

// Get all users with pagination, search, and filters (admin only)
router.get(
  '/',
  roleMiddleware(ROLES.ADMIN),
  validate(getUsersQuerySchema, 'query'),
  userController.getUsers
);

// Update user by ID (admin only)
router.put(
  '/:id',
  roleMiddleware(ROLES.ADMIN),
  validate(updateUserAdminSchema),
  userController.updateUser
);

// Delete user by ID (admin only)
router.delete('/:id', roleMiddleware(ROLES.ADMIN), userController.deleteUser);

export default router;

