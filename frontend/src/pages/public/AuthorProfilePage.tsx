import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Globe, Github, Twitter, Linkedin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PostGrid } from '@/components/blog/PostGrid';
import { Pagination } from '@/components/shared/Pagination';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthorProfile, useUserPosts } from '@/hooks/useUsers';
import { useToggleFollow } from '@/hooks/useBookmarks';
import { useAuthStore } from '@/store/authStore';

const SOCIAL_ICONS = [
  { key: 'website' as const, icon: Globe },
  { key: 'twitter' as const, icon: Twitter },
  { key: 'github' as const, icon: Github },
  { key: 'linkedin' as const, icon: Linkedin },
];

export default function AuthorProfilePage() {
  const { username = '' } = useParams();
  const [page, setPage] = useState(1);
  const { data: author, isLoading: authorLoading, isError: authorError, refetch: refetchAuthor } = useAuthorProfile(username);
  const { data, isLoading: postsLoading, isError: postsError, refetch: refetchPosts } = useUserPosts(author?.id, {
    page,
    limit: 9,
    status: 'published',
  });
  const currentUser = useAuthStore((s) => s.user);
  const toggleFollow = useToggleFollow();

  if (authorLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (authorError) {
    return (
      <div className="container py-20">
        <QueryErrorState title="Couldn't load this profile" onRetry={() => refetchAuthor()} />
      </div>
    );
  }

  if (!author) {
    return <div className="container py-20 text-center text-muted-foreground">Author not found.</div>;
  }

  const isSelf = currentUser?.username === author.username;
  const socialLinks = SOCIAL_ICONS.filter(({ key }) => author.socialLinks?.[key]);

  return (
    <div className="container py-10">
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center sm:flex-row sm:text-left">
        <Avatar className="h-20 w-20">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback className="text-xl">{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{author.name}</h1>
          <p className="text-sm text-muted-foreground">@{author.username}</p>
          {author.bio && <p className="mt-2 max-w-lg text-sm">{author.bio}</p>}

          <div className="mt-3 flex justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
            <Link to={`/authors/${author.username}/followers`} className="hover:text-foreground">
              <strong className="text-foreground">{author.followersCount}</strong> followers
            </Link>
            <Link to={`/authors/${author.username}/following`} className="hover:text-foreground">
              <strong className="text-foreground">{author.followingCount}</strong> following
            </Link>
            {author.postsCount !== undefined && (
              <span>
                <strong className="text-foreground">{author.postsCount}</strong> posts
              </span>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div className="mt-3 flex justify-center gap-3 text-muted-foreground sm:justify-start">
              {socialLinks.map(({ key, icon: Icon }) => (
                <a
                  key={key}
                  href={author.socialLinks?.[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                  aria-label={key}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
        {!isSelf && currentUser && (
          <Button
            variant={author.isFollowing ? 'outline' : 'default'}
            onClick={() =>
              toggleFollow.mutate({ userId: author.id, following: Boolean(author.isFollowing), username: author.username })
            }
            disabled={toggleFollow.isPending}
          >
            {author.isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>

      <h2 className="mb-6 mt-10 text-xl font-bold">Published posts</h2>
      <PostGrid
        posts={data?.posts}
        isLoading={postsLoading}
        isError={postsError}
        onRetry={() => refetchPosts()}
        emptyTitle="No published posts yet"
      />

      {data?.meta && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} className="mt-10" />
      )}
    </div>
  );
}
