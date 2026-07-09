import { IUser } from '../models/User';

/** Normalizes a full User document into the consistent `id`-based shape used across all auth/profile responses. */
export function toUserPayload(user: IUser) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    socialLinks: user.socialLinks,
    role: user.role,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    createdAt: user.createdAt,
  };
}
