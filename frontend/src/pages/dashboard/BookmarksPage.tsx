import { Bookmark } from 'lucide-react';
import { PostGrid } from '@/components/blog/PostGrid';
import { useBookmarks } from '@/hooks/useBookmarks';

export default function BookmarksPage() {
  const { data, isLoading, isError, refetch } = useBookmarks();
  const posts = data?.map((b) => b.post);

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Bookmark className="h-5 w-5" /> Bookmarks
      </h1>
      <p className="text-muted-foreground">Posts you've saved to read later.</p>

      <div className="mt-6">
        <PostGrid
          posts={posts}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          emptyTitle="No bookmarks yet"
          emptyDescription="Tap the bookmark icon on any post to save it here."
        />
      </div>
    </div>
  );
}
