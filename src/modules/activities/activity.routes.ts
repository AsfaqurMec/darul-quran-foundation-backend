import { Router } from 'express';
import { activityController } from './activity.controller';
import { authMiddleware } from '@/modules/common/middleware/auth.middleware';
import { validate } from '@/modules/common/middleware/validate.middleware';
import { createActivitySchema, updateActivitySchema } from './activity.schema';

const router = Router();

// All activity routes require authentication
router.use(authMiddleware);

// Get all activities
router.get('/', activityController.getAllActivities);

// Get single activity
router.get('/:id', activityController.getActivityById);

// Create new activity
router.post('/', validate(createActivitySchema), activityController.createActivity);

// Update activity
router.put('/:id', validate(updateActivitySchema), activityController.updateActivity);

// Delete activity
router.delete('/:id', activityController.deleteActivity);

export default router;

