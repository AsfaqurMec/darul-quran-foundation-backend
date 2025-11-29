import { Router } from 'express';
import { volunteerController } from './volunteer.controller';
import { authMiddleware } from '../common/middleware/auth.middleware';
import { validate } from '../common/middleware/validate.middleware';
import {
  createVolunteerSchema,
  updateVolunteerStatusSchema,
  getVolunteersQuerySchema,
} from './volunteer.schema';
import { uploadVolunteerProfileImage } from '../uploads/upload.middleware';

const router = Router();

// Create volunteer application (public - no auth required)
router.post(
  '/',
  uploadVolunteerProfileImage.single('profileImage'),
  validate(createVolunteerSchema),
  volunteerController.createVolunteerApplication
);

// All routes below require authentication
router.use(authMiddleware);

// Get all volunteer applications with pagination and filters
router.get(
  '/',
  validate(getVolunteersQuerySchema, 'query'),
  volunteerController.getAllVolunteerApplications
);

// Update volunteer application status
router.patch(
  '/:id/status',
  validate(updateVolunteerStatusSchema),
  volunteerController.updateVolunteerApplicationStatus
);

// Delete volunteer application
router.delete('/:id', volunteerController.deleteVolunteerApplication);

export default router;

