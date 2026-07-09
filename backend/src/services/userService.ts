import { Types } from 'mongoose';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Follow } from '../models/Follow';
import { PaginationResult } from '../utils/pagination';

const PUBLIC_FIELDS = 'name username avatar bio socialLinks role followersCount followingCount createdAt';

export async function searchUsers(search: string | undefined, pagination: PaginationResult, viewerId?: string) {
  const filter: Record<string, unknown> = { isActive: true };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(PUBLIC_FIELDS)
      .sort({ followersCount: -1, createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    User.countDocuments(filter),
  ]);

  const withFollowState = await attachIsFollowing(users, viewerId);
  return { users: withFollowState, total };
}

export async function getPublicProfile(username: string, viewerId?: string) {
  const user = await User.findOne({ username: username.toLowerCase(), isActive: true }).select(PUBLIC_FIELDS);
  if (!user) return null;

  const [postsCount, isFollowing] = await Promise.all([
    Post.countDocuments({ author: user._id, status: 'published' }),
    viewerId ? Follow.exists({ follower: viewerId, following: user._id }) : Promise.resolve(null),
  ]);

  return {
    ...user.toObject(),
    id: user._id,
    postsCount,
    isFollowing: Boolean(isFollowing),
  };
}

async function attachIsFollowing(users: any[], viewerId?: string) {
  if (!viewerId || users.length === 0) {
    return users.map((u) => ({ ...u.toObject(), id: u._id, isFollowing: false }));
  }

  const followingIds = new Set(
    (await Follow.find({ follower: viewerId, following: { $in: users.map((u) => u._id) } }).select('following')).map(
      (f) => f.following.toString()
    )
  );

  return users.map((u) => ({ ...u.toObject(), id: u._id, isFollowing: followingIds.has(u._id.toString()) }));
}

export async function getFollowers(userId: string, pagination: PaginationResult, viewerId?: string) {
  const [edges, total] = await Promise.all([
    Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate({ path: 'follower', select: PUBLIC_FIELDS }),
    Follow.countDocuments({ following: userId }),
  ]);

  const users = edges.map((e) => e.follower).filter(Boolean) as any[];
  const withFollowState = await attachIsFollowing(users, viewerId);
  return { users: withFollowState, total };
}

export async function getFollowing(userId: string, pagination: PaginationResult, viewerId?: string) {
  const [edges, total] = await Promise.all([
    Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate({ path: 'following', select: PUBLIC_FIELDS }),
    Follow.countDocuments({ follower: userId }),
  ]);

  const users = edges.map((e) => e.following).filter(Boolean) as any[];
  const withFollowState = await attachIsFollowing(users, viewerId);
  return { users: withFollowState, total };
}

export async function getUserPosts(
  userId: string,
  pagination: PaginationResult,
  options: { status: 'draft' | 'published' | 'all'; viewerId?: string; isOwnerOrAdmin: boolean }
) {
  const filter: Record<string, unknown> = { author: userId };

  if (options.status !== 'all') {
    filter.status = options.status;
  } else if (!options.isOwnerOrAdmin) {
    // Non-owners can never see drafts, regardless of requested status filter.
    filter.status = 'published';
  }

  if (!options.isOwnerOrAdmin && filter.status !== 'published') {
    filter.status = 'published';
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('author', 'name username avatar'),
    Post.countDocuments(filter),
  ]);

  return { posts, total };
}

export function isValidObjectId(id: string) {
  return Types.ObjectId.isValid(id);
}
