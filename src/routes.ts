import { Router } from 'express';
import authRoutes from '@/modules/auth/auth.routes';
import userRoutes from '@/modules/users/user.routes';
import uploadRoutes from '@/modules/uploads/upload.routes';

const router = Router();

// Mount module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/uploads', uploadRoutes);

export default router;

