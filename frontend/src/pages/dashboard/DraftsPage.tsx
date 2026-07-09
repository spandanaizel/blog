import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Pencil, Trash2, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { PostListSkeleton } from '@/components/shared/Skeletons';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { usePosts, useDeletePost, useUpdatePost } from '@/hooks/usePosts';
import { useAuthStore } from '@/store/authStore';

export default function DraftsPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch } = usePosts({ author: user?.id, status: 'draft', limit: 50, sort: 'newest' });
  const deletePost = useDeletePost();
  const updatePost = useUpdatePost();
  const [toDelete, setToDelete] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-bold">Drafts</h1>
      <p className="text-muted-foreground">Unfinished posts only you can see.</p>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <PostListSkeleton count={3} />
        ) : isError ? (
          <QueryErrorState title="Couldn't load your drafts" onRetry={() => refetch()} />
        ) : !data?.posts.length ? (
          <EmptyState icon={FileText} title="No drafts yet" description="Start a new post and save it as a draft to see it here." />
        ) : (
          data.posts.map((post) => (
            <Card key={post._id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{post.title || 'Untitled post'}</p>
                  <p className="truncate text-sm text-muted-foreground">{post.excerpt || 'No content yet'}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/dashboard/write/${post.slug}`}>
                      <Pencil className="h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updatePost.mutate({ id: post._id, payload: { status: 'published' } })}
                  >
                    <Send className="h-4 w-4" /> Publish
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setToDelete(post._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this draft?"
        description="This can't be undone."
        destructive
        confirmLabel="Delete"
        loading={deletePost.isPending}
        onConfirm={() => {
          if (toDelete) deletePost.mutate(toDelete);
          setToDelete(null);
        }}
      />
    </div>
  );
}
