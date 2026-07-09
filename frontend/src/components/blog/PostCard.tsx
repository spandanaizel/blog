import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Post } from '@/types';
import { usePrefetchPost, usePrefetchAuthor } from '@/hooks/usePrefetch';

function PostCardImpl({ post, index = 0 }: { post: Post; index?: number }) {
  const prefetchPost = usePrefetchPost();
  const prefetchAuthor = usePrefetchAuthor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
        <Link to={`/blog/${post.slug}`} className="block" onMouseEnter={() => prefetchPost(post.slug)}>
          <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5 text-3xl font-bold text-primary/40">
                {post.title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        <div className="space-y-3 p-5">
          <Link
            to={`/authors/${post.author.username}`}
            className="flex items-center gap-2"
            onMouseEnter={() => prefetchAuthor(post.author.username)}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback className="text-[10px]">{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-muted-foreground">{post.author.name}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </Link>

          <Link to={`/blog/${post.slug}`} onMouseEnter={() => prefetchPost(post.slug)}>
            <h3 className="line-clamp-2 text-lg font-bold leading-snug transition-colors group-hover:text-primary">
              {post.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          </Link>

          <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" /> {post.likesCount ?? post.likes?.length ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> {post.commentsCount}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export const PostCard = memo(PostCardImpl);
