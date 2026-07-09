import { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { useAuthors } from '@/hooks/useUsers';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { PostListSkeleton } from '@/components/shared/Skeletons';
import { AuthorListCard } from '@/components/blog/AuthorListCard';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function AuthorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const { data, isLoading, isError, refetch } = useAuthors({ page, limit: 12, search: debouncedSearch || undefined });

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Authors</h1>
      </div>

      <div className="relative mb-8 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search authors by name or username"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <PostListSkeleton count={6} />
      ) : isError ? (
        <QueryErrorState title="Couldn't load authors" onRetry={() => refetch()} />
      ) : !data?.users?.length ? (
        <EmptyState title="No authors found" description="Try a different search term." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.users.map((author) => (
            <AuthorListCard key={author.id} user={author} />
          ))}
        </div>
      )}

      {data?.meta && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} className="mt-10" />
      )}
    </div>
  );
}
