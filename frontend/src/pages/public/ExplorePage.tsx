import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PostGrid } from '@/components/blog/PostGrid';
import { Pagination } from '@/components/shared/Pagination';
import { usePosts } from '@/hooks/usePosts';
import { cn } from '@/lib/utils';
import type { PostQueryParams } from '@/api/postsApi';

const SORT_OPTIONS: { label: string; value: PostQueryParams['sort'] }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Most popular', value: 'popular' },
  { label: 'Most liked', value: 'mostLiked' },
];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const search = searchParams.get('search') || undefined;
  const sort = (searchParams.get('sort') as PostQueryParams['sort']) || 'newest';
  const category = searchParams.get('category') || undefined;
  const tag = searchParams.get('tag') || undefined;

  const { data, isLoading, isError, refetch } = usePosts({ page, limit: 9, search, sort, category, tag });

  function updateSort(value: string) {
    const next = new URLSearchParams(searchParams);
    next.set('sort', value);
    setSearchParams(next);
    setPage(1);
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Explore stories</h1>
        <p className="text-muted-foreground">
          {search ? (
            <>
              Showing results for <span className="font-medium text-foreground">"{search}"</span>
            </>
          ) : (
            'Discover writing from across the Inkwell community.'
          )}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateSort(opt.value as string)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              sort === opt.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <PostGrid
        posts={data?.posts}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No stories found"
        emptyDescription="Try a different search term or filter."
      />

      {data?.meta && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} className="mt-10" />
      )}
    </div>
  );
}
