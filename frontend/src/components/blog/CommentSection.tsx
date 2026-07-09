import { useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import { CommentForm } from '@/components/blog/CommentForm';
import { CommentItem } from '@/components/blog/CommentItem';
import { CommentSkeleton } from '@/components/shared/Skeletons';
import { EmptyState } from '@/components/shared/EmptyState';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

export function CommentSection({ postId }: { postId: string }) {
  const { data: comments, isLoading } = useComments(postId);
  const createComment = useCreateComment(postId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const totalCount = useMemo(
    () => (comments ? comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0) : 0),
    [comments]
  );

  return (
    <section className="mt-12">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <MessageCircle className="h-5 w-5" /> Discussion {comments ? `(${totalCount})` : ''}
      </h2>

      <div className="mt-5">
        {isAuthenticated ? (
          <CommentForm isSubmitting={createComment.isPending} onSubmit={(content) => createComment.mutate({ content })} />
        ) : (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>{' '}
            to join the discussion.
          </p>
        )}
      </div>

      <div className="mt-8 space-y-6">
        {isLoading ? (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        ) : !comments || comments.length === 0 ? (
          <EmptyState title="No comments yet" description="Be the first to share your thoughts on this post." />
        ) : (
          comments.map((comment) => <CommentItem key={comment._id} comment={comment} postId={postId} />)
        )}
      </div>
    </section>
  );
}
