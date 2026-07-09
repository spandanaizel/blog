import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middleware/auth';
import { parsePagination, buildMeta } from '../utils/pagination';
import { getActivityFeed } from '../services/activityService';

// GET /api/activity
export const getMyActivityFeed = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pagination = parsePagination(req.query, { limit: 20, maxLimit: 50 });
  const { items, total } = await getActivityFeed(req.user!.id, pagination.page, pagination.limit);

  sendResponse(res, 200, items, 'Activity feed fetched', buildMeta(pagination.page, pagination.limit, total));
});
