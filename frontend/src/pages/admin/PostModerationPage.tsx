import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { PostListSkeleton } from '@/components/shared/Skeletons';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { usePosts, useDeletePost } from '@/hooks/usePosts';

export default function PostModerationPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = usePosts({ page, limit: 10, sort: 'newest' });
  const deletePost = useDeletePost();
  const [toDelete, setToDelete] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-bold">Post moderation</h1>
      <p className="text-muted-foreground">Review and remove posts that violate community guidelines.</p>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          <PostListSkeleton count={4} />
        ) : isError ? (
          <QueryErrorState title="Couldn't load posts" onRetry={() => refetch()} />
        ) : !data?.posts.length ? (
          <EmptyState title="No posts found" />
        ) : (
          data.posts.map((post) => (
            <Card key={post._id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    by {post.author.name} · {post.views} views · {post.commentsCount} comments
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/blog/${post.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4" /> View
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setToDelete(post._id)}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} className="mt-8" />}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Remove this post?"
        description="This will permanently delete the post for all users."
        destructive
        confirmLabel="Remove post"
        loading={deletePost.isPending}
        onConfirm={() => {
          if (toDelete) deletePost.mutate(toDelete);
          setToDelete(null);
        }}
      />
    </div>
  );
}
