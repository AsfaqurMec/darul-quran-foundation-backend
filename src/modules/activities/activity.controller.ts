import { Request, Response, NextFunction } from 'express';
import { activityService } from './activity.service';
import { ApiError } from '../common/middleware/error.middleware';
import { HTTP_STATUS } from '../../constants';
import { asyncHandler } from '../common/middleware/async.handler';

export class ActivityController {
  /**
   * Get all activities
   * GET /api/activities
   */
  getAllActivities = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const activities = await activityService.getAllActivities();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: activities.map((activity) => ({
        id: activity.id,
        title: activity.title,
        tag: activity.tag,
        description: activity.description,
        image: activity.image,
        thumbnail: activity.thumbnail,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      })),
    });
  });

  /**
   * Get single activity
   * GET /api/activities/:id
   */
  getActivityById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const activity = await activityService.getActivityById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: activity?.id,
        title: activity?.title,
        tag: activity?.tag,
        description: activity?.description,
        image: activity?.image,
        thumbnail: activity?.thumbnail,
        createdAt: activity?.createdAt,
        updatedAt: activity?.updatedAt,
      },
    });
  });

  /**
   * Create new activity
   * POST /api/activities
   */
  createActivity = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { title, tag, description, image, thumbnail } = req.body;

    const activity = await activityService.createActivity({
      title,
      tag,
      description,
      image,
      thumbnail,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        id: activity.id,
        title: activity.title,
        tag: activity.tag,
        description: activity.description,
        image: activity.image,
        thumbnail: activity.thumbnail,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      },
    });
  });

  /**
   * Update activity
   * PUT /api/activities/:id
   */
  updateActivity = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, tag, description, image, thumbnail } = req.body;

    const activity = await activityService.updateActivity(id, {
      ...(title && { title }),
      ...(tag && { tag }),
      ...(description && { description }),
      ...(image && { image }),
      ...(thumbnail && { thumbnail }),
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: activity?.id,
        title: activity?.title,
        tag: activity?.tag,
        description: activity?.description,
        image: activity?.image,
        thumbnail: activity?.thumbnail,
        createdAt: activity?.createdAt,
        updatedAt: activity?.updatedAt,
      },
    });
  });

  /**
   * Delete activity
   * DELETE /api/activities/:id
   */
  deleteActivity = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await activityService.deleteActivity(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Activity deleted successfully',
    });
  });
}

export const activityController = new ActivityController();

