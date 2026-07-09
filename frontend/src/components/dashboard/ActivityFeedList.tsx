import { useCallback, useMemo } from 'react';
import { FixedSizeList } from 'react-window';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, UserPlus, AtSign, Bookmark, Send, Pencil, ShieldCheck } from 'lucide-react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import type { ActivityFeedItem, ActivityFeedType } from '@/types';

const ICONS: Record<ActivityFeedType, typeof Heart> = {
  publish_post: Send,
  update_post: Pencil,
  like: Heart,
  comment: MessageCircle,
  reply: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
  bookmark: Bookmark,
  role_change: ShieldCheck,
};

const ROW_HEIGHT = 72;
const LIST_HEIGHT = 480;

function ActivityRow({ item }: { item: ActivityFeedItem }) {
  const Icon = ICONS[item.type];
  return (
    <div className="flex items-start gap-3 px-1 py-2">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 rounded-lg border border-border p-3">
        <p className="line-clamp-2 text-sm">{item.message}</p>
        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p>
      </div>
    </div>
  );
}

/**
 * Activity feed rendered with react-window: only the rows currently in (or
 * near) the visible window are mounted, so this stays cheap even with
 * hundreds of loaded items. Reaching near the end of the loaded window
 * triggers fetching the next page (infinite scroll via onItemsRendered
 * rather than an IntersectionObserver, since rows outside the virtualized
 * viewport aren't actually in the DOM for an observer to watch).
 */
export function ActivityFeedList() {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useActivityFeed();

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  const handleItemsRendered = useCallback(
    ({ visibleStopIndex }: { visibleStopIndex: number }) => {
      if (hasNextPage && !isFetchingNextPage && visibleStopIndex >= items.length - 3) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage, items.length]
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <QueryErrorState title="Couldn't load your activity" onRetry={() => refetch()} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Publishing posts and engaging with the community will show up here."
      />
    );
  }

  return (
    <div>
      <FixedSizeList
        height={Math.min(LIST_HEIGHT, items.length * ROW_HEIGHT)}
        width="100%"
        itemCount={items.length}
        itemSize={ROW_HEIGHT}
        onItemsRendered={handleItemsRendered}
      >
        {({ index, style }: { index: number; style: React.CSSProperties }) => (
          <div style={style}>
            <ActivityRow item={items[index]} />
          </div>
        )}
      </FixedSizeList>

      {isFetchingNextPage && (
        <div className="space-y-2 pt-2">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      )}

      {!hasNextPage && items.length > 5 && (
        <p className="py-3 text-center text-xs text-muted-foreground">You've reached the beginning.</p>
      )}
    </div>
  );
}
