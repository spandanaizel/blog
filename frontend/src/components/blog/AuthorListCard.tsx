import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useToggleFollow } from '@/hooks/useBookmarks';
import { usePrefetchAuthor } from '@/hooks/usePrefetch';
import type { PublicUser } from '@/types';

function AuthorListCardImpl({ user }: { user: PublicUser }) {
  const currentUser = useAuthStore((s) => s.user);
  const toggleFollow = useToggleFollow();
  const prefetchAuthor = usePrefetchAuthor();
  const isSelf = currentUser?.username === user.username;

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <Link
          to={`/authors/${user.username}`}
          className="flex min-w-0 flex-1 items-center gap-4"
          onMouseEnter={() => prefetchAuthor(user.username)}
        >
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
            <p className="text-xs text-muted-foreground">{user.followersCount} followers</p>
          </div>
        </Link>

        {!isSelf && currentUser && (
          <Button
            size="sm"
            variant={user.isFollowing ? 'outline' : 'default'}
            className="shrink-0"
            onClick={() => toggleFollow.mutate({ userId: user.id, following: Boolean(user.isFollowing), username: user.username })}
            disabled={toggleFollow.isPending}
          >
            {user.isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export const AuthorListCard = memo(AuthorListCardImpl);
