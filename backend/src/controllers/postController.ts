import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Post } from '../models/Post';
import { Tag } from '../models/Tag';
import { Category } from '../models/Category';
import { ApiError } from '../utils/ApiError';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middleware/auth';
import { generateUniqueSlug, estimateReadTime, generateExcerpt } from '../utils/postHelpers';
import { ActivityLog } from '../models/ActivityLog';
import { createNotification } from '../services/notificationService';
import { Follow } from '../models/Follow';
import { emitToPostRoom } from '../sockets';
import { removeImage } from '../services/cloudinaryService';
import { logger } from '../utils/logger';

// GET /api/posts
export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '10',
    category,
    tag,
    author,
    search,
    sort = 'newest',
    status = 'published',
  } = req.query as Record<string, string>;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const filter: Record<string, unknown> = { status };
  if (category) filter.category = category.toLowerCase();
  if (tag) filter.tags = tag.toLowerCase();
  if (author) filter.author = author;
  if (search) filter.$text = { $search: search };

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  if (sort === 'popular') sortOption = { views: -1 };
  if (sort === 'mostLiked') sortOption = { likesCount: -1 };

  const aggregatePipeline: any[] = [
    { $match: filter },
    { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
    { $sort: sortOption },
    { $skip: (pageNum - 1) * limitNum },
    { $limit: limitNum },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      },
    },
    { $unwind: '$author' },
    {
      $project: {
        title: 1,
        slug: 1,
        excerpt: 1,
        coverImage: 1,
        tags: 1,
        category: 1,
        readTime: 1,
        views: 1,
        likesCount: 1,
        commentsCount: 1,
        status: 1,
        publishedAt: 1,
        createdAt: 1,
        'author._id': 1,
        'author.name': 1,
        'author.username': 1,
        'author.avatar': 1,
      },
    },
  ];

  const [posts, total] = await Promise.all([
    Post.aggregate(aggregatePipeline),
    Post.countDocuments(filter),
  ]);

  sendResponse(res, 200, posts, 'Posts fetched', {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
});

// GET /api/posts/:slug
export const getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate(
    'author',
    'name username avatar bio followersCount'
  );

  if (!post) throw ApiError.notFound('Post not found.');

  // Increment views (fire and forget pattern, but awaited for consistency in this simple app)
  post.views += 1;
  await post.save();

  const relatedPosts = await Post.find({
    _id: { $ne: post._id },
    status: 'published',
    $or: [{ category: post.category }, { tags: { $in: post.tags } }],
  })
    .limit(4)
    .select('title slug excerpt coverImage readTime createdAt author')
    .populate('author', 'name username avatar');

  sendResponse(res, 200, { post, relatedPosts });
});

// POST /api/posts
export const createPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, content, excerpt, coverImage, coverImagePublicId, tags = [], category = 'general', status = 'draft' } = req.body;

  const slug = await generateUniqueSlug(title);
  const readTime = estimateReadTime(content);
  const finalExcerpt = excerpt || generateExcerpt(content);

  const post = await Post.create({
    title,
    slug,
    content,
    excerpt: finalExcerpt,
    coverImage: coverImage || '',
    coverImagePublicId: coverImagePublicId || '',
    tags: tags.map((t: string) => t.toLowerCase()),
    category: category.toLowerCase(),
    author: req.user!.id,
    readTime,
    status,
    publishedAt: status === 'published' ? new Date() : undefined,
  });

  // Upsert tags/category counters
  await Promise.all([
    ...post.tags.map((t: string) =>
      Tag.findOneAndUpdate(
        { slug: t },
        { $setOnInsert: { name: t, slug: t }, $inc: { postCount: 1 } },
        { upsert: true }
      )
    ),
    Category.findOneAndUpdate(
      { slug: post.category },
      { $setOnInsert: { name: post.category, slug: post.category }, $inc: { postCount: 1 } },
      { upsert: true }
    ),
  ]);

  await ActivityLog.create({
    user: req.user!.id,
    action: status === 'published' ? 'publish_post' : 'create_post',
    targetId: post._id,
  });

  // Notify followers when publishing
  if (status === 'published') {
    const followers = await Follow.find({ following: req.user!.id }).select('follower');
    await Promise.all(
      followers.map((f) =>
        createNotification({
          recipient: f.follower,
          sender: req.user!.id,
          type: 'mention',
          message: `${req.user!.id} published a new post: "${post.title}"`,
          post: post._id,
        })
      )
    );
  }

  sendResponse(res, 201, post, 'Post created successfully');
});

// PUT /api/posts/:id
export const updatePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found.');

  const isOwner = post.author.toString() === req.user!.id;
  const isAdmin = req.user!.role === 'admin';
  if (!isOwner && !isAdmin) throw ApiError.forbidden('You cannot edit this post.');

  const { title, content, excerpt, coverImage, coverImagePublicId, tags, category, status } = req.body;

  if (title && title !== post.title) {
    post.title = title;
    post.slug = await generateUniqueSlug(title);
  }
  if (content) {
    post.content = content;
    post.readTime = estimateReadTime(content);
  }
  if (excerpt !== undefined) post.excerpt = excerpt;
  if (coverImage !== undefined && coverImage !== post.coverImage) {
    if (post.coverImagePublicId) {
      await removeImage(post.coverImagePublicId);
    }
    post.coverImage = coverImage;
    post.coverImagePublicId = coverImagePublicId || '';
  }
  if (tags) post.tags = tags.map((t: string) => t.toLowerCase());
  if (category) post.category = category.toLowerCase();

  const wasPublished = post.status === 'published';
  if (status) {
    post.status = status;
    if (status === 'published' && !wasPublished) post.publishedAt = new Date();
  }

  await post.save();
  await ActivityLog.create({ user: req.user!.id, action: 'update_post', targetId: post._id });

  sendResponse(res, 200, post, 'Post updated successfully');
});

// DELETE /api/posts/:id
export const deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found.');

  const isOwner = post.author.toString() === req.user!.id;
  const isAdmin = req.user!.role === 'admin';
  if (!isOwner && !isAdmin) throw ApiError.forbidden('You cannot delete this post.');

  if (post.coverImagePublicId) {
    await removeImage(post.coverImagePublicId);
  }

  await post.deleteOne();
  await ActivityLog.create({
    user: req.user!.id,
    action: isAdmin && !isOwner ? 'admin_delete_post' : 'delete_post',
    targetId: post._id,
  });

  if (isAdmin && !isOwner) {
    logger.warn(`[admin] ${req.user!.id} deleted post ${post._id} ("${post.title}") authored by ${post.author}`);
  }

  sendResponse(res, 200, null, 'Post deleted successfully');
});

// POST /api/posts/:id/like
export const likePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found.');

  const userId = req.user!.id;
  if (post.likes.some((id) => id.toString() === userId)) {
    sendResponse(res, 200, { likesCount: post.likes.length }, 'Already liked');
    return;
  }

  post.likes.push(userId as any);
  await post.save();

  await ActivityLog.create({ user: userId, action: 'like_post', targetId: post._id });

  await createNotification({
    recipient: post.author.toString(),
    sender: userId,
    type: 'like',
    message: `Someone liked your post "${post.title}"`,
    post: post._id,
  });

  emitToPostRoom(post._id.toString(), 'post:likeUpdated', { postId: post._id, likesCount: post.likes.length });

  sendResponse(res, 200, { likesCount: post.likes.length }, 'Post liked');
});

// DELETE /api/posts/:id/like
export const unlikePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found.');

  post.likes = post.likes.filter((id) => id.toString() !== req.user!.id) as any;
  await post.save();

  emitToPostRoom(post._id.toString(), 'post:likeUpdated', { postId: post._id, likesCount: post.likes.length });

  sendResponse(res, 200, { likesCount: post.likes.length }, 'Post unliked');
});
