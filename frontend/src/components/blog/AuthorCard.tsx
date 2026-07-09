import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useToggleFollow } from '@/hooks/useBookmarks';
import type { Author } from '@/types';

export function AuthorCard({
  author,
  isFollowing = false,
}: {
  author: Author;
  isFollowing?: boolean;
}) {
  const currentUser = useAuthStore((s) => s.user);
  const toggleFollow = useToggleFollow();
  const isSelf = currentUser?.username === author.username;

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <Avatar className="h-16 w-16">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <Link to={`/authors/${author.username}`} className="font-semibold hover:underline">
            {author.name}
          </Link>
          <p className="text-xs text-muted-foreground">@{author.username}</p>
        </div>
        {author.bio && <p className="text-sm text-muted-foreground">{author.bio}</p>}
        {author.followersCount !== undefined && (
          <p className="text-xs text-muted-foreground">{author.followersCount} followers</p>
        )}

        {!isSelf && currentUser && (
          <Button
            size="sm"
            variant={isFollowing ? 'outline' : 'default'}
            className="mt-1 w-full"
            onClick={() => toggleFollow.mutate({ userId: author._id, following: isFollowing })}
            disabled={toggleFollow.isPending}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
