import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import { useAuthorProfile, useFollowers } from '@/hooks/useUsers';
import { AuthorListCard } from '@/components/blog/AuthorListCard';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { PostListSkeleton } from '@/components/shared/Skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthorFollowersPage() {
  const { username = '' } = useParams();
  const [page, setPage] = useState(1);
  const { data: author, isLoading: authorLoading } = useAuthorProfile(username);
  const { data, isLoading, isError, refetch } = useFollowers(author?.id, page);

  if (authorLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!author) {
    return <div className="container py-20 text-center text-muted-foreground">Author not found.</div>;
  }

  return (
    <div className="container py-10">
      <Link to={`/authors/${username}`} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {author.name}'s profile
      </Link>

      <div className="mb-8 flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Followers of {author.name}</h1>
      </div>

      {isLoading ? (
        <PostListSkeleton count={6} />
      ) : isError ? (
        <QueryErrorState title="Couldn't load followers" onRetry={() => refetch()} />
      ) : !data?.users?.length ? (
        <EmptyState icon={Users} title="No followers yet" description={`${author.name} hasn't been followed by anyone yet.`} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.users.map((u) => (
            <AuthorListCard key={u.id} user={u} />
          ))}
        </div>
      )}

      {data?.meta && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} className="mt-10" />
      )}
    </div>
  );
}
