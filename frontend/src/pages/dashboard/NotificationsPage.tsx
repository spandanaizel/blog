import { useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Heart, MessageCircle, UserPlus, AtSign, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/store/notificationStore';
import { useMarkNotificationRead, useMarkAllNotificationsRead, useNotificationsPage } from '@/hooks/useNotifications';
import type { AppNotification, NotificationType } from '@/types';
import { cn } from '@/lib/utils';

const ICONS: Record<NotificationType, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  reply: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
  role_change: ShieldCheck,
};

const ROW_HEIGHT = 84;
const LIST_HEIGHT = 560;

export default function NotificationsPage() {
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { loadMore, hasMore, isLoadingMore } = useNotificationsPage();

  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const n: AppNotification = notifications[index];
      const Icon = ICONS[n.type];
      return (
        <div style={style} className="px-1 py-1.5">
          <Card
            className={cn('cursor-pointer transition-colors', !n.isRead && 'border-primary/40 bg-primary/5')}
            onClick={() => !n.isRead && markRead.mutate(n._id)}
          >
            <CardContent className="flex items-start gap-3 p-4">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    },
    [notifications, markRead]
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Bell className="h-5 w-5" /> Notifications
        </h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
            Mark all read
          </Button>
        )}
      </div>
      <p className="text-muted-foreground">Real-time updates on likes, comments, replies, and follows.</p>

      <div className="mt-6">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Nothing here yet"
            description="Likes, comments, replies, and new followers will show up here in real time."
          />
        ) : (
          // Virtualized: only rows near the visible viewport are ever mounted,
          // so this stays fast even with hundreds of accumulated notifications.
          <FixedSizeList
            height={Math.min(LIST_HEIGHT, notifications.length * ROW_HEIGHT)}
            width="100%"
            itemCount={notifications.length}
            itemSize={ROW_HEIGHT}
          >
            {Row}
          </FixedSizeList>
        )}

        {notifications.length > 0 && hasMore && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" size="sm" onClick={loadMore} disabled={isLoadingMore}>
              {isLoadingMore ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
