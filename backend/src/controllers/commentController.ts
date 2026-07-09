import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { ApiError } from '../utils/ApiError';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from '../services/notificationService';
import { emitToPostRoom } from '../sockets';
import { ActivityLog } from '../models/ActivityLog';

// POST /api/comments
export const createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { post: postId, content, parentComment = null } = req.body;

  const post = await Post.findById(postId);
  if (!post) throw ApiError.notFound('Post not found.');

  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent) throw ApiError.notFound('Parent comment not found.');
  }

  const comment = await Comment.create({
    post: postId,
    author: req.user!.id,
    content,
    parentComment: parentComment || null,
  });

  post.commentsCount += 1;
  await post.save();

  await ActivityLog.create({ user: req.user!.id, action: 'comment', targetId: comment._id });

  const populated = await comment.populate('author', 'name username avatar');

  emitToPostRoom(postId, 'comment:new', populated);

  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (parent) {
      await createNotification({
        recipient: parent.author.toString(),
        sender: req.user!.id,
        type: 'reply',
        message: 'Someone replied to your comment',
        post: postId,
        comment: comment._id,
      });
    }
  } else {
    await createNotification({
      recipient: post.author.toString(),
      sender: req.user!.id,
      type: 'comment',
      message: `Someone commented on your post "${post.title}"`,
      post: postId,
      comment: comment._id,
    });
  }

  sendResponse(res, 201, populated, 'Comment added');
});

// GET /api/comments/:postId
export const getCommentsForPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate('author', 'name username avatar')
    .sort({ createdAt: 1 });

  // Build nested tree: top-level comments with replies attached
  const byId: Record<string, any> = {};
  comments.forEach((c) => {
    byId[c._id.toString()] = { ...c.toObject(), replies: [] };
  });

  const roots: any[] = [];
  comments.forEach((c) => {
    const node = byId[c._id.toString()];
    if (c.parentComment) {
      const parent = byId[c.parentComment.toString()];
      if (parent) parent.replies.push(node);
      else roots.push(node); // orphaned reply fallback
    } else {
      roots.push(node);
    }
  });

  sendResponse(res, 200, roots);
});

// PUT /api/comments/:id
export const updateComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found.');

  if (comment.author.toString() !== req.user!.id) {
    throw ApiError.forbidden('You cannot edit this comment.');
  }

  comment.content = req.body.content;
  comment.isEdited = true;
  await comment.save();

  const populated = await comment.populate('author', 'name username avatar');
  emitToPostRoom(comment.post.toString(), 'comment:updated', populated);

  sendResponse(res, 200, populated, 'Comment updated');
});

// DELETE /api/comments/:id
export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found.');

  const isOwner = comment.author.toString() === req.user!.id;
  const isAdmin = req.user!.role === 'admin';
  if (!isOwner && !isAdmin) throw ApiError.forbidden('You cannot delete this comment.');

  // Delete this comment and all its direct replies (one level, matches our nested model)
  const replyIds = await Comment.find({ parentComment: comment._id }).distinct('_id');
  const totalDeleted = 1 + replyIds.length;

  await Comment.deleteMany({ _id: { $in: [comment._id, ...replyIds] } });
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -totalDeleted } });

  emitToPostRoom(comment.post.toString(), 'comment:deleted', { commentId: comment._id, replyIds });

  sendResponse(res, 200, null, 'Comment deleted');
});

// POST /api/comments/:id/like
export const likeComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found.');

  const userId = req.user!.id;
  const alreadyLiked = comment.likes.some((id) => id.toString() === userId);

  if (alreadyLiked) {
    comment.likes = comment.likes.filter((id) => id.toString() !== userId) as any;
  } else {
    comment.likes.push(userId as any);
  }
  await comment.save();

  emitToPostRoom(comment.post.toString(), 'comment:likeUpdated', {
    commentId: comment._id,
    likesCount: comment.likes.length,
  });

  sendResponse(res, 200, { likesCount: comment.likes.length, liked: !alreadyLiked });
});
