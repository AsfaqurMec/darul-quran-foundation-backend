import { Notice, INotice } from './notice.model';
import { ApiError } from '../common/middleware/error.middleware';
import { HTTP_STATUS } from '../../constants';

export class NoticeService {
  /**
   * Create a new notice
   */
  async createNotice(input: {
    title: string;
    subTitle: string;
    date: string;
    category: string;
    fullContent: string;
  }): Promise<INotice> {
    const notice = await Notice.create(input);
    return notice;
  }

  /**
   * Get all notices
   */
  async getAllNotices(): Promise<INotice[]> {
    return Notice.find().sort({ createdAt: -1 });
  }

  /**
   * Get notice by ID
   */
  async getNoticeById(id: string): Promise<INotice | null> {
    const notice = await Notice.findById(id);
    if (!notice) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Notice not found');
    }
    return notice;
  }

  /**
   * Update notice
   */
  async updateNotice(
    id: string,
    updates: Partial<{
      title: string;
      subTitle: string;
      date: string;
      category: string;
      fullContent: string;
    }>
  ): Promise<INotice | null> {
    const notice = await Notice.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!notice) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Notice not found');
    }

    return notice;
  }

  /**
   * Delete notice
   */
  async deleteNotice(id: string): Promise<void> {
    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Notice not found');
    }
  }
}

export const noticeService = new NoticeService();

