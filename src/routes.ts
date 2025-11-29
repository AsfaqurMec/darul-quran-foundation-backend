import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import uploadRoutes from './modules/uploads/upload.routes';
import activityRoutes from './modules/activities/activity.routes';
import blogRoutes from './modules/blogs/blog.routes';
import noticeRoutes from './modules/notices/notice.routes';
import galleryRoutes from './modules/gallery/gallery.routes';
import heroImageRoutes from './modules/hero-images/hero-image.routes';
import donationRoutes from './modules/donations/donation.routes';
import programRoutes from './modules/programs/program.routes';
import donationCategoryRoutes from './modules/donation-categories/donation-category.routes';
import volunteerRoutes from './modules/volunteers/volunteer.routes';
import memberRoutes from './modules/members/member.routes';

const router = Router();

// Mount module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/uploads', uploadRoutes);
router.use('/activities', activityRoutes);
router.use('/blogs', blogRoutes);
router.use('/notices', noticeRoutes);
router.use('/gallery', galleryRoutes);
router.use('/hero-images', heroImageRoutes);
router.use('/donations', donationRoutes);
router.use('/programs', programRoutes);
router.use('/donation-categories', donationCategoryRoutes);
router.use('/volunteers', volunteerRoutes);
router.use('/members', memberRoutes);
 
export default router;

