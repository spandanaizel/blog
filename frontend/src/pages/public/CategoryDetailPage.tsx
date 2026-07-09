import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { PostGrid } from '@/components/blog/PostGrid';
import { Pagination } from '@/components/shared/Pagination';

export default function CategoryDetailPage() {
  const { category = '' } = useParams();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = usePosts({ category, page, limit: 9, sort: 'newest' });

  const label = category.replace(/-/g, ' ');

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center gap-2">
        <Layers className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold capitalize">{label}</h1>
      </div>

      <PostGrid
        posts={data?.posts}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyTitle="No posts in this category yet"
        emptyDescription="Check back soon for new writing."
      />

      {data?.meta && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} className="mt-10" />
      )}
    </div>
  );
}
