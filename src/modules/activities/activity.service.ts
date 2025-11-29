import { Activity, IActivity } from './activity.model';
import { ApiError } from '../common/middleware/error.middleware';
import { HTTP_STATUS } from '../../constants';

export class ActivityService {
  /**
   * Create a new activity
   */
  async createActivity(input: {
    title: string;
    tag: string;
    description: string;
    image: string;
    thumbnail: string;
  }): Promise<IActivity> {
    const activity = await Activity.create(input);
    return activity;
  }

  /**
   * Get all activities
   */
  async getAllActivities(): Promise<IActivity[]> {
    return Activity.find().sort({ createdAt: -1 });
  }

  /**
   * Get activity by ID
   */
  async getActivityById(id: string): Promise<IActivity | null> {
    const activity = await Activity.findById(id);
    if (!activity) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Activity not found');
    }
    return activity;
  }

  /**
   * Update activity
   */
  async updateActivity(
    id: string,
    updates: Partial<{
      title: string;
      tag: string;
      description: string;
      image: string;
      thumbnail: string;
    }>
  ): Promise<IActivity | null> {
    const activity = await Activity.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!activity) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Activity not found');
    }

    return activity;
  }

  /**
   * Delete activity
   */
  async deleteActivity(id: string): Promise<void> {
    const activity = await Activity.findByIdAndDelete(id);
    if (!activity) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Activity not found');
    }
  }
}

export const activityService = new ActivityService();

