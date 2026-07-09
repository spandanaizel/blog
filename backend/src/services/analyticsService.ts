import { Types } from 'mongoose';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { Bookmark } from '../models/Bookmark';
import { Follow } from '../models/Follow';
import { User } from '../models/User';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthBucket {
  year: number;
  month: number; // 1-12
  label: string;
}

function getTrailingMonths(count = 6): MonthBucket[] {
  const months: MonthBucket[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: MONTH_LABELS[d.getMonth()] });
  }
  return months;
}

function fillTrend(months: MonthBucket[], dataMap: Map<string, number>) {
  return months.map((m) => ({ month: m.label, value: dataMap.get(`${m.year}-${m.month}`) ?? 0 }));
}

/** Counts documents per trailing month based on a date field. Fully accurate — every source document is individually timestamped. */
async function aggregateMonthlyCount(
  model: any,
  match: Record<string, unknown>,
  dateField: string,
  months: MonthBucket[]
) {
  const earliest = new Date(months[0].year, months[0].month - 1, 1);
  const rows = await model.aggregate([
    { $match: { ...match, [dateField]: { $gte: earliest } } },
    {
      $group: {
        _id: { y: { $year: `$${dateField}` }, m: { $month: `$${dateField}` } },
        count: { $sum: 1 },
      },
    },
  ]);
  const map = new Map<string, number>(rows.map((r: any) => [`${r._id.y}-${r._id.m}`, r.count]));
  return fillTrend(months, map);
}

/**
 * Sums a numeric/array-size expression per trailing month, bucketed by a date field.
 * NOTE: for fields like `views` and `likes` (which only store a running total, not
 * individually timestamped events) this buckets by the *post's* creation month as the
 * closest available proxy for "when that engagement happened" — it is real, queried data
 * (never randomly generated), but it is an approximation rather than a true historical trend.
 */
async function aggregateMonthlySum(
  model: any,
  match: Record<string, unknown>,
  dateField: string,
  months: MonthBucket[],
  sumExpr: unknown
) {
  const earliest = new Date(months[0].year, months[0].month - 1, 1);
  const rows = await model.aggregate([
    { $match: { ...match, [dateField]: { $gte: earliest } } },
    {
      $group: {
        _id: { y: { $year: `$${dateField}` }, m: { $month: `$${dateField}` } },
        total: { $sum: sumExpr },
      },
    },
  ]);
  const map = new Map<string, number>(rows.map((r: any) => [`${r._id.y}-${r._id.m}`, r.total]));
  return fillTrend(months, map);
}

async function getCategoryDistribution(match: Record<string, unknown>) {
  const rows = await Post.aggregate([
    { $match: match },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return rows.map((r) => ({ category: r._id, count: r.count }));
}

export async function getUserDashboardStats(userId: string) {
  const months = getTrailingMonths(6);
  const userObjectId = new Types.ObjectId(userId);

  const [user, totals, viewsTrend, likesTrend, monthlyActivity, categoryDistribution, topPosts] = await Promise.all([
    User.findById(userId).select('followersCount followingCount'),
    Post.aggregate([
      { $match: { author: userObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          views: { $sum: '$views' },
          likes: { $sum: { $size: { $ifNull: ['$likes', []] } } },
          comments: { $sum: '$commentsCount' },
          bookmarks: { $sum: { $size: { $ifNull: ['$bookmarks', []] } } },
        },
      },
    ]),
    aggregateMonthlySum(Post, { author: userObjectId }, 'createdAt', months, '$views'),
    aggregateMonthlySum(Post, { author: userObjectId }, 'createdAt', months, { $size: { $ifNull: ['$likes', []] } }),
    aggregateMonthlyCount(Post, { author: userObjectId }, 'createdAt', months),
    getCategoryDistribution({ author: userObjectId }),
    Post.find({ author: userObjectId, status: 'published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title slug views commentsCount likes'),
  ]);

  const publishedRow = totals.find((t: any) => t._id === 'published');
  const draftRow = totals.find((t: any) => t._id === 'draft');

  const userPostIds = await Post.find({ author: userObjectId }).distinct('_id');

  const [commentsTrend, bookmarksTrend, followersTrend] = await Promise.all([
    aggregateMonthlyCount(Comment, { post: { $in: userPostIds } }, 'createdAt', months),
    aggregateMonthlyCount(Bookmark, { post: { $in: userPostIds } }, 'createdAt', months),
    aggregateMonthlyCount(Follow, { following: userObjectId }, 'createdAt', months),
  ]);

  return {
    postsCount: publishedRow?.count ?? 0,
    draftCount: draftRow?.count ?? 0,
    totalViews: (publishedRow?.views ?? 0) + (draftRow?.views ?? 0),
    totalLikes: (publishedRow?.likes ?? 0) + (draftRow?.likes ?? 0),
    totalComments: (publishedRow?.comments ?? 0) + (draftRow?.comments ?? 0),
    totalBookmarks: (publishedRow?.bookmarks ?? 0) + (draftRow?.bookmarks ?? 0),
    followersCount: user?.followersCount ?? 0,
    followingCount: user?.followingCount ?? 0,
    viewsTrend,
    likesTrend,
    commentsTrend,
    bookmarksTrend,
    followersTrend,
    monthlyActivity: monthlyActivity.map((m) => ({ month: m.month, posts: m.value })),
    categoryDistribution,
    topPosts: topPosts.map((p) => ({
      _id: p._id,
      title: p.title,
      slug: p.slug,
      views: p.views,
      likesCount: p.likes?.length ?? 0,
      commentsCount: p.commentsCount,
    })),
  };
}

export async function getAdminDashboardStats() {
  const months = getTrailingMonths(6);

  const [
    usersCount,
    postTotals,
    monthlyActivity,
    categoryDistribution,
    topPosts,
    topAuthors,
    followersTrend,
    bookmarksTrend,
    commentsTrend,
    likesTrend,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Post.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          views: { $sum: '$views' },
        },
      },
    ]),
    aggregateMonthlyCount(Post, {}, 'createdAt', months),
    getCategoryDistribution({}),
    Post.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title slug views commentsCount likes author')
      .populate('author', 'name username avatar'),
    User.find({ isActive: true }).sort({ followersCount: -1 }).limit(5).select('name username avatar followersCount'),
    aggregateMonthlyCount(Follow, {}, 'createdAt', months),
    aggregateMonthlyCount(Bookmark, {}, 'createdAt', months),
    aggregateMonthlyCount(Comment, {}, 'createdAt', months),
    aggregateMonthlySum(Post, {}, 'createdAt', months, { $size: { $ifNull: ['$likes', []] } }),
  ]);

  const publishedRow = postTotals.find((t: any) => t._id === 'published');
  const draftRow = postTotals.find((t: any) => t._id === 'draft');
  const totalCommentsCount = await Comment.countDocuments();
  const totalBookmarksCount = await Bookmark.countDocuments();

  return {
    usersCount,
    postsCount: publishedRow?.count ?? 0,
    draftCount: draftRow?.count ?? 0,
    totalViews: (publishedRow?.views ?? 0) + (draftRow?.views ?? 0),
    totalComments: totalCommentsCount,
    totalBookmarks: totalBookmarksCount,
    monthlyActivity: monthlyActivity.map((m) => ({ month: m.month, posts: m.value })),
    categoryDistribution,
    followersTrend,
    bookmarksTrend,
    commentsTrend,
    likesTrend,
    topPosts: topPosts.map((p: any) => ({
      _id: p._id,
      title: p.title,
      slug: p.slug,
      views: p.views,
      likesCount: p.likes?.length ?? 0,
      commentsCount: p.commentsCount,
      author: p.author,
    })),
    topAuthors: topAuthors.map((u: any) => ({
      _id: u._id,
      name: u.name,
      username: u.username,
      avatar: u.avatar,
      followersCount: u.followersCount,
    })),
  };
}
