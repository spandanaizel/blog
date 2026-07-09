export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  socialLinks: {
    website?: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  role: 'user' | 'admin';
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export interface Author {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  followersCount?: number;
}

/** Shape returned by the public users endpoints (directory, profile, followers/following). */
export interface PublicUser {
  id: string;
  _id?: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  socialLinks: User['socialLinks'];
  role: 'user' | 'admin';
  followersCount: number;
  followingCount: number;
  createdAt: string;
  isFollowing?: boolean;
  postsCount?: number;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  category: string;
  author: Author;
  readTime: number;
  views: number;
  likesCount?: number;
  likes?: string[];
  bookmarks?: string[];
  commentsCount: number;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: Author;
  content: string;
  parentComment: string | null;
  likes: string[];
  isEdited: boolean;
  replies: Comment[];
  createdAt: string;
}

export interface Bookmark {
  _id: string;
  user: string;
  post: Post;
  createdAt: string;
}

export type NotificationType = 'like' | 'comment' | 'reply' | 'follow' | 'mention' | 'role_change';

export interface AppNotification {
  _id: string;
  recipient: string;
  sender: Author;
  type: NotificationType;
  post?: string;
  comment?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationListMeta extends PaginationMeta {
  unreadCount: number;
}

export interface TrendPoint {
  month: string;
  value: number;
}

export interface MonthlyActivityPoint {
  month: string;
  posts: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface TopPost {
  _id: string;
  title: string;
  slug: string;
  views: number;
  likesCount: number;
  commentsCount: number;
  author?: Author;
}

export interface TopAuthor {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  followersCount: number;
}

export interface DashboardStats {
  postsCount: number;
  draftCount: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalBookmarks: number;
  followersCount: number;
  followingCount: number;
  viewsTrend: TrendPoint[];
  likesTrend: TrendPoint[];
  commentsTrend: TrendPoint[];
  bookmarksTrend: TrendPoint[];
  followersTrend: TrendPoint[];
  monthlyActivity: MonthlyActivityPoint[];
  categoryDistribution: CategoryCount[];
  topPosts: TopPost[];
}

export interface AdminStats {
  usersCount: number;
  postsCount: number;
  draftCount: number;
  totalViews: number;
  totalComments: number;
  totalBookmarks: number;
  monthlyActivity: MonthlyActivityPoint[];
  categoryDistribution: CategoryCount[];
  followersTrend: TrendPoint[];
  bookmarksTrend: TrendPoint[];
  commentsTrend: TrendPoint[];
  likesTrend: TrendPoint[];
  topPosts: TopPost[];
  topAuthors: TopAuthor[];
}

export type ActivityFeedType =
  | 'publish_post'
  | 'update_post'
  | 'like'
  | 'comment'
  | 'reply'
  | 'follow'
  | 'mention'
  | 'bookmark'
  | 'role_change';

export interface ActivityFeedItem {
  id: string;
  type: ActivityFeedType;
  message: string;
  createdAt: string;
  meta?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta & Record<string, unknown>;
}
