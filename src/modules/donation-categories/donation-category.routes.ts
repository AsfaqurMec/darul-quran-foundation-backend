import { Router } from 'express';
import { donationCategoryController } from './donation-category.controller';
import { authMiddleware } from '../common/middleware/auth.middleware';
import { validate } from '../common/middleware/validate.middleware';
import { createDonationCategorySchema, updateDonationCategorySchema } from './donation-category.schema';
import { upload } from '../uploads/upload.middleware';
import { tokenMiddleware } from '../common/middleware/token.middleware';

const router = Router();

// Get all donation categories (admin)
router.get('/admin', tokenMiddleware, donationCategoryController.getAllDonationCategories);
// Get donation category by slug (admin)
router.get('/admin/:slug', tokenMiddleware, donationCategoryController.getDonationCategoryBySlug);
// Get single donation category by ID (admin)
router.get('/admin/:id', tokenMiddleware, donationCategoryController.getDonationCategoryById);

// Get all donation categories (public)
router.get('/',tokenMiddleware, donationCategoryController.getAllDonationCategories);

// Get donation category by slug (public)
router.get('/:slug', tokenMiddleware, donationCategoryController.getDonationCategoryBySlug);

// Get single donation category by ID (public)
router.get('/:id', tokenMiddleware, donationCategoryController.getDonationCategoryById);

// All mutation routes require authentication
router.use(authMiddleware);

// Create new donation category - handle thumbnail file upload
router.post(
  '/',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    // Accept alias 'image' in case frontend sends singular field name
    { name: 'image', maxCount: 1 },
  ]),
  validate(createDonationCategorySchema),
  donationCategoryController.createDonationCategory
);

// Update donation category - handle thumbnail file upload
router.put(
  '/:id',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    // Accept alias 'image' to mirror POST
    { name: 'image', maxCount: 1 },
  ]),
  validate(updateDonationCategorySchema),
  donationCategoryController.updateDonationCategory
);

// Delete donation category
router.delete('/:id', donationCategoryController.deleteDonationCategory);

export default router;

