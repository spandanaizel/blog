import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Follow } from '../models/Follow';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from '../services/notificationService';
import { ActivityLog } from '../models/ActivityLog';

// POST /api/follow/:userId
export const followUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const followerId = req.user!.id;

  if (userId === followerId) {
    throw ApiError.badRequest('You cannot follow yourself.');
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) throw ApiError.notFound('User not found.');

  const existing = await Follow.findOne({ follower: followerId, following: userId });
  if (existing) {
    sendResponse(res, 200, null, 'Already following');
    return;
  }

  await Follow.create({ follower: followerId, following: userId });
  await Promise.all([
    User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } }),
    User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } }),
  ]);

  await createNotification({
    recipient: userId,
    sender: followerId,
    type: 'follow',
    message: 'You have a new follower',
  });

  await ActivityLog.create({ user: followerId, action: 'follow_user', targetId: userId });

  sendResponse(res, 201, null, 'Followed successfully');
});

// DELETE /api/follow/:userId
export const unfollowUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const followerId = req.user!.id;

  const deleted = await Follow.findOneAndDelete({ follower: followerId, following: userId });
  if (!deleted) throw ApiError.notFound('Follow relationship not found.');

  await Promise.all([
    User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } }),
    User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } }),
  ]);

  sendResponse(res, 200, null, 'Unfollowed successfully');
});
