import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Bookmark, Clock, Eye } from 'lucide-react';
import { usePost } from '@/hooks/usePosts';
import { useToggleLike } from '@/hooks/usePosts';
import { useToggleBookmark, useToggleFollow } from '@/hooks/useBookmarks';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TagPill } from '@/components/blog/TagPill';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { CommentSection } from '@/components/blog/CommentSection';
import { PostCard } from '@/components/blog/PostCard';
import { LazyImage } from '@/components/shared/LazyImage';
import { AsyncErrorBoundary } from '@/components/shared/AsyncErrorBoundary';
import { cn } from '@/lib/utils';

export default function BlogDetailPage() {
  const { slug = '' } = useParams();
  const { data, isLoading } = usePost(slug);
  const contentRef = useRef<HTMLDivElement>(null);
  const currentUser = useAuthStore((s) => s.user);
  const toggleLike = useToggleLike();
  const toggleBookmark = useToggleBookmark();
  const toggleFollow = useToggleFollow();
  const { data: bookmarks } = useBookmarks();

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-10">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="mt-4 h-64 w-full" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
      </div>
    );
  }

  if (!data?.post) {
    return <div className="container py-20 text-center text-muted-foreground">Post not found.</div>;
  }

  const { post, relatedPosts } = data;
  const liked = currentUser ? post.likes?.includes(currentUser.id) ?? false : false;
  const bookmarked = bookmarks?.some((b) => b.post._id === post._id) ?? false;
  const url = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <article className="container py-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_240px]">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <Link to={`/categories/${post.category}`} className="text-xs font-semibold uppercase tracking-wide text-primary">
              {post.category}
            </Link>
          </div>

          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{post.title}</h1>

          <div className="mt-5 flex items-center justify-between gap-4">
            <Link to={`/authors/${post.author.username}`} className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{post.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })} · {post.readTime} min read
                </p>
              </div>
            </Link>

            {currentUser?.username !== post.author.username && currentUser && (
              <Button size="sm" variant="outline" onClick={() => toggleFollow.mutate({ userId: post.author._id, following: false })}>
                Follow
              </Button>
            )}
          </div>

          {post.coverImage && (
            <LazyImage
              src={post.coverImage}
              alt={post.title}
              aspectClassName="aspect-[16/9]"
              containerClassName="mt-8 rounded-lg"
              className="rounded-lg"
            />
          )}

          <div
            ref={contentRef}
            className="prose prose-slate mt-8 max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-md"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between border-y border-border py-4">
            <div className="flex items-center gap-5">
              <button
                onClick={() => toggleLike.mutate({ id: post._id, liked, slug: post.slug })}
                className={cn('flex items-center gap-1.5 text-sm font-medium hover:text-primary', liked && 'text-primary')}
              >
                <Heart className={cn('h-5 w-5', liked && 'fill-current')} /> {post.likesCount ?? post.likes?.length ?? 0}
              </button>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" /> {post.views}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> {post.readTime} min
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleBookmark.mutate({ postId: post._id, bookmarked })}
                className={cn('text-muted-foreground hover:text-primary', bookmarked && 'text-primary')}
                aria-label="Bookmark"
              >
                <Bookmark className={cn('h-5 w-5', bookmarked && 'fill-current')} />
              </button>
              <ShareButtons title={post.title} url={url} />
            </div>
          </div>

          <AsyncErrorBoundary title="Couldn't load the discussion">
            <CommentSection postId={post._id} />
          </AsyncErrorBoundary>

          {relatedPosts?.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-6 text-xl font-bold">Related stories</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {relatedPosts.slice(0, 4).map((rp, i) => (
                  <PostCard key={rp._id} post={rp} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>

        <TableOfContents contentRef={contentRef} />
      </div>
    </article>
  );
}
