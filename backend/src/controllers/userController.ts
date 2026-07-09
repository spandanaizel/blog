import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middleware/auth';
import { parsePagination, buildMeta } from '../utils/pagination';
import {
  searchUsers,
  getPublicProfile,
  getFollowers,
  getFollowing,
  getUserPosts,
  isValidObjectId,
} from '../services/userService';
import { toUserPayload } from '../utils/userPayload';
import { removeImage } from '../services/cloudinaryService';

// GET /api/users
export const listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pagination = parsePagination(req.query);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  const { users, total } = await searchUsers(search, pagination, req.user?.id);

  sendResponse(res, 200, users, 'Users fetched', buildMeta(pagination.page, pagination.limit, total));
});

// GET /api/users/:username
export const getUserByUsername = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await getPublicProfile(req.params.username, req.user?.id);
  if (!profile) throw ApiError.notFound('User not found.');
  sendResponse(res, 200, { user: profile });
});

// GET /api/users/profile/me
export const getMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found.');
  sendResponse(res, 200, { user: toUserPayload(user) });
});

// PUT /api/users/profile
export const updateMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, bio, avatar, avatarPublicId, socialLinks } = req.body;

  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found.');

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;

  if (avatar !== undefined && avatar !== user.avatar) {
    // Clean up the previous Cloudinary asset (if any) once it's no longer referenced.
    if (user.avatarPublicId) {
      await removeImage(user.avatarPublicId);
    }
    user.avatar = avatar;
    user.avatarPublicId = avatarPublicId || '';
  }

  if (socialLinks !== undefined) {
    user.socialLinks = { ...user.socialLinks, ...socialLinks };
  }

  await user.save();
  sendResponse(res, 200, { user: toUserPayload(user) }, 'Profile updated successfully');
});

// PUT /api/users/change-password
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user!.id).select('+password');
  if (!user) throw ApiError.notFound('User not found.');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect.');
  }

  user.password = newPassword;
  user.tokenVersion += 1; // invalidate other active sessions
  await user.save();

  sendResponse(res, 200, null, 'Password changed successfully');
});

// GET /api/users/:id/posts
export const getUserPostsHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw ApiError.badRequest('Invalid user id.');

  const pagination = parsePagination(req.query);
  const requestedStatus = (req.query.status as string) || 'published';
  const isOwnerOrAdmin = req.user ? req.user.id === id || req.user.role === 'admin' : false;

  const { posts, total } = await getUserPosts(id, pagination, {
    status: (requestedStatus as 'draft' | 'published' | 'all') ?? 'published',
    viewerId: req.user?.id,
    isOwnerOrAdmin,
  });

  sendResponse(res, 200, posts, 'Posts fetched', buildMeta(pagination.page, pagination.limit, total));
});

// GET /api/users/:id/followers
export const getUserFollowers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw ApiError.badRequest('Invalid user id.');

  const pagination = parsePagination(req.query);
  const { users, total } = await getFollowers(id, pagination, req.user?.id);

  sendResponse(res, 200, users, 'Followers fetched', buildMeta(pagination.page, pagination.limit, total));
});

// GET /api/users/:id/following
export const getUserFollowing = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw ApiError.badRequest('Invalid user id.');

  const pagination = parsePagination(req.query);
  const { users, total } = await getFollowing(id, pagination, req.user?.id);

  sendResponse(res, 200, users, 'Following fetched', buildMeta(pagination.page, pagination.limit, total));
});
