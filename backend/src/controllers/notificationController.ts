import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Notification } from '../models/Notification';
import { ApiError } from '../utils/ApiError';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middleware/auth';
import { parsePagination, buildMeta } from '../utils/pagination';

// GET /api/notifications
export const listNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pagination = parsePagination(req.query, { limit: 20, maxLimit: 50 });

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user!.id })
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('sender', 'name username avatar'),
    Notification.countDocuments({ recipient: req.user!.id }),
    Notification.countDocuments({ recipient: req.user!.id, isRead: false }),
  ]);

  sendResponse(res, 200, notifications, 'Notifications fetched', {
    ...buildMeta(pagination.page, pagination.limit, total),
    unreadCount,
  });
});

// PATCH /api/notifications/:id/read
export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user!.id });
  if (!notification) throw ApiError.notFound('Notification not found.');

  notification.isRead = true;
  await notification.save();

  sendResponse(res, 200, notification, 'Notification marked as read');
});

// PATCH /api/notifications/read-all
export const markAllNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ recipient: req.user!.id, isRead: false }, { $set: { isRead: true } });
  sendResponse(res, 200, null, 'All notifications marked as read');
});
