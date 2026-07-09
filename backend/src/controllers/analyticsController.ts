import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middleware/auth';
import { getUserDashboardStats, getAdminDashboardStats } from '../services/analyticsService';
import { isValidObjectId } from '../services/userService';

// GET /api/analytics/dashboard
export const getDashboardAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await getUserDashboardStats(req.user!.id);
  sendResponse(res, 200, stats);
});

// GET /api/analytics/admin
export const getAdminAnalytics = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const stats = await getAdminDashboardStats();
  sendResponse(res, 200, stats);
});

// GET /api/analytics/user/:id
export const getUserAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw ApiError.badRequest('Invalid user id.');

  const isSelf = req.user!.id === id;
  const isAdmin = req.user!.role === 'admin';
  if (!isSelf && !isAdmin) {
    throw ApiError.forbidden('You can only view your own analytics.');
  }

  const stats = await getUserDashboardStats(id);
  sendResponse(res, 200, stats);
});
