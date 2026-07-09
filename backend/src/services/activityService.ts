import { ActivityLog } from '../models/ActivityLog';
import { Notification } from '../models/Notification';
import { Post } from '../models/Post';

export interface ActivityFeedItem {
  id: string;
  type: 'publish_post' | 'update_post' | 'like' | 'comment' | 'reply' | 'follow' | 'mention' | 'bookmark' | 'role_change';
  message: string;
  createdAt: Date;
  meta?: Record<string, unknown>;
}

const SELF_ACTION_MESSAGES: Record<string, string> = {
  publish_post: 'You published a new post',
  update_post: 'You updated a post',
};

/**
 * Builds a unified, newest-first activity timeline for a user by merging:
 *  - their own authoring actions (ActivityLog: publish_post / update_post)
 *  - events they received from others (Notification: like / comment / reply / follow / mention)
 *  - bookmarks received on their posts (ActivityLog: bookmark_post — bookmarks don't generate
 *    a Notification record by design, so this is the only source for that event type)
 * Each source is fetched at up to `limit` each so the merge always has enough recent items
 * from every side before slicing down to the requested page size.
 */
export async function getActivityFeed(userId: string, page: number, limit: number) {
  const fetchSize = page * limit;

  const myPosts = await Post.find({ author: userId }).select('_id title');
  const myPostIds = myPosts.map((p) => p._id);
  const postTitleById = new Map(myPosts.map((p) => [p._id.toString(), p.title]));

  const [selfActions, received, bookmarkLogs] = await Promise.all([
    ActivityLog.find({ user: userId, action: { $in: ['publish_post', 'update_post'] } })
      .sort({ createdAt: -1 })
      .limit(fetchSize),
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(fetchSize)
      .populate('sender', 'name username avatar'),
    myPostIds.length
      ? ActivityLog.find({ action: 'bookmark_post', targetId: { $in: myPostIds }, user: { $ne: userId } })
          .sort({ createdAt: -1 })
          .limit(fetchSize)
          .populate('user', 'name username avatar')
      : Promise.resolve([]),
  ]);

  const fromActivityLog: ActivityFeedItem[] = selfActions.map((a) => ({
    id: a._id.toString(),
    type: a.action as ActivityFeedItem['type'],
    message: SELF_ACTION_MESSAGES[a.action] || a.action,
    createdAt: a.createdAt,
    meta: { targetId: a.targetId },
  }));

  const fromNotifications: ActivityFeedItem[] = received.map((n: any) => ({
    id: n._id.toString(),
    type: n.type,
    message: n.message,
    createdAt: n.createdAt,
    meta: { sender: n.sender, post: n.post, comment: n.comment },
  }));

  const fromBookmarks: ActivityFeedItem[] = bookmarkLogs.map((log: any) => {
    const title = postTitleById.get(log.targetId?.toString() || '') || 'your post';
    return {
      id: log._id.toString(),
      type: 'bookmark' as const,
      message: `Someone bookmarked "${title}"`,
      createdAt: log.createdAt,
      meta: { actor: log.user, postId: log.targetId },
    };
  });

  const merged = [...fromActivityLog, ...fromNotifications, ...fromBookmarks].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const start = (page - 1) * limit;
  const items = merged.slice(start, start + limit);
  const total = merged.length;

  return { items, total };
}
