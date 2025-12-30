import { Router } from 'express';
import { galleryCategoryController } from './gallery-category.controller';
import { authMiddleware } from '../common/middleware/auth.middleware';
import { validate } from '../common/middleware/validate.middleware';
import { createGalleryCategorySchema, updateGalleryCategorySchema } from './gallery-category.schema';
import { originMiddleware } from '../common/middleware/origin.middleware';
import { tokenMiddleware } from '../common/middleware/token.middleware';

const router = Router();

// Get all gallery categories (admin)
router.get('/admin', galleryCategoryController.getAllGalleryCategories);
// Get single gallery category by ID (admin)
router.get('/admin/:id', galleryCategoryController.getGalleryCategoryById);

// All routes require authentication
// router.use(authMiddleware);

// Get all gallery categories with pagination and search
router.get('/', tokenMiddleware, galleryCategoryController.getAllGalleryCategories);
// Get single gallery category by ID
router.get('/:id', tokenMiddleware, galleryCategoryController.getGalleryCategoryById);

router.use(authMiddleware);

// Create new gallery category
router.post(
  '/',
  validate(createGalleryCategorySchema),
  galleryCategoryController.createGalleryCategory
);

// Update gallery category
router.put(
  '/:id',
  validate(updateGalleryCategorySchema),
  galleryCategoryController.updateGalleryCategory
);

// Delete gallery category
router.delete('/:id', galleryCategoryController.deleteGalleryCategory);

export default router;

