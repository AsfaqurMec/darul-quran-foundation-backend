import { Request, Response, NextFunction } from 'express';
import { noticeService } from './notice.service';
import { HTTP_STATUS } from '@/constants';
import { asyncHandler } from '@/modules/common/middleware/async.handler';

export class NoticeController {
  /**
   * Get all notices
   * GET /api/notices
   */
  getAllNotices = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const notices = await noticeService.getAllNotices();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: notices.map((notice) => ({
        id: notice.id,
        title: notice.title,
        subTitle: notice.subTitle,
        date: notice.date,
        category: notice.category,
        fullContent: notice.fullContent,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt,
      })),
    });
  });

  /**
   * Get single notice
   * GET /api/notices/:id
   */
  getNoticeById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const notice = await noticeService.getNoticeById(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: notice?.id,
        title: notice?.title,
        subTitle: notice?.subTitle,
        date: notice?.date,
        category: notice?.category,
        fullContent: notice?.fullContent,
        createdAt: notice?.createdAt,
        updatedAt: notice?.updatedAt,
      },
    });
  });

  /**
   * Create new notice
   * POST /api/notices
   */
  createNotice = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { title, subTitle, date, category, fullContent } = req.body;

    const notice = await noticeService.createNotice({
      title,
      subTitle,
      date,
      category,
      fullContent,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        id: notice.id,
        title: notice.title,
        subTitle: notice.subTitle,
        date: notice.date,
        category: notice.category,
        fullContent: notice.fullContent,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt,
      },
    });
  });

  /**
   * Update notice
   * PUT /api/notices/:id
   */
  updateNotice = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, subTitle, date, category, fullContent } = req.body;

    const notice = await noticeService.updateNotice(id, {
      ...(title && { title }),
      ...(subTitle && { subTitle }),
      ...(date && { date }),
      ...(category && { category }),
      ...(fullContent && { fullContent }),
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: notice?.id,
        title: notice?.title,
        subTitle: notice?.subTitle,
        date: notice?.date,
        category: notice?.category,
        fullContent: notice?.fullContent,
        createdAt: notice?.createdAt,
        updatedAt: notice?.updatedAt,
      },
    });
  });

  /**
   * Delete notice
   * DELETE /api/notices/:id
   */
  deleteNotice = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await noticeService.deleteNotice(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Notice deleted successfully',
    });
  });
}

export const noticeController = new NoticeController();

