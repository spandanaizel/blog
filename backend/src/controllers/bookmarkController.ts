import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Bookmark } from '../models/Bookmark';
import { Post } from '../models/Post';
import { ApiError } from '../utils/ApiError';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middleware/auth';
import { ActivityLog } from '../models/ActivityLog';

// POST /api/bookmarks
export const addBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { postId } = req.body;

  const post = await Post.findById(postId);
  if (!post) throw ApiError.notFound('Post not found.');

  const existing = await Bookmark.findOne({ user: req.user!.id, post: postId });
  if (existing) {
    sendResponse(res, 200, existing, 'Already bookmarked');
    return;
  }

  const bookmark = await Bookmark.create({ user: req.user!.id, post: postId });
  await ActivityLog.create({ user: req.user!.id, action: 'bookmark_post', targetId: post._id });
  sendResponse(res, 201, bookmark, 'Post bookmarked');
});

// DELETE /api/bookmarks/:id
export const removeBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
  // :id may be either the bookmark's own _id or the postId — support both for a smoother frontend experience.
  const bookmark = await Bookmark.findOneAndDelete({
    user: req.user!.id,
    $or: [{ _id: req.params.id }, { post: req.params.id }],
  });

  if (!bookmark) throw ApiError.notFound('Bookmark not found.');
  sendResponse(res, 200, null, 'Bookmark removed');
});

// GET /api/bookmarks
export const getBookmarks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const bookmarks = await Bookmark.find({ user: req.user!.id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'post',
      select: 'title slug excerpt coverImage readTime createdAt author',
      populate: { path: 'author', select: 'name username avatar' },
    });

  sendResponse(res, 200, bookmarks);
});
