import { Router } from 'express';
import { galleryCategoryController } from './gallery-category.controller';
import { authMiddleware } from '../common/middleware/auth.middleware';
import { validate } from '../common/middleware/validate.middleware';
import { createGalleryCategorySchema, updateGalleryCategorySchema } from './gallery-category.schema';
import { originMiddleware } from '../common/middleware/origin.middleware';

const router = Router();

// All routes require authentication
// router.use(authMiddleware);

// Get all gallery categories with pagination and search
router.get('/', galleryCategoryController.getAllGalleryCategories);
// Get single gallery category by ID
router.get('/:id', galleryCategoryController.getGalleryCategoryById);

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

