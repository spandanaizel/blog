import { FileQuestion } from 'lucide-react';
import { PostCard } from '@/components/blog/PostCard';
import { PostListSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import type { Post } from '@/types';

interface PostGridProps {
  posts: Post[] | undefined;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function PostGrid({ posts, isLoading, isError, onRetry, emptyTitle = 'No posts yet', emptyDescription }: PostGridProps) {
  if (isLoading) return <PostListSkeleton />;

  if (isError) {
    return <QueryErrorState title="Couldn't load posts" onRetry={onRetry} />;
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        title={emptyTitle}
        description={emptyDescription || 'Check back soon, or try a different filter.'}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, i) => (
        <PostCard key={post._id} post={post} index={i} />
      ))}
    </div>
  );
}
