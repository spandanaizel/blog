import { memo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Reply, Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CommentForm } from '@/components/blog/CommentForm';
import { useAuthStore } from '@/store/authStore';
import { useCreateComment, useDeleteComment, useLikeComment, useUpdateComment } from '@/hooks/useComments';
import type { Comment } from '@/types';
import { cn } from '@/lib/utils';

function CommentItemImpl({ comment, postId, depth = 0 }: { comment: Comment; postId: string; depth?: number }) {
  const currentUser = useAuthStore((s) => s.user);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createComment = useCreateComment(postId);
  const updateComment = useUpdateComment(postId);
  const deleteComment = useDeleteComment(postId);
  const likeComment = useLikeComment(postId);

  const isOwner = currentUser && currentUser.id === comment.author._id;
  const isAdmin = currentUser?.role === 'admin';
  const liked = currentUser ? comment.likes.includes(currentUser.id) : false;

  return (
    <div className={cn('flex gap-3', depth > 0 && 'mt-3')}>
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            {comment.isEdited && ' · edited'}
          </span>
        </div>

        {editing ? (
          <div className="mt-1.5 space-y-2">
            <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="min-h-[60px]" />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  updateComment.mutate({ id: comment._id, content: editValue });
                  setEditing(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm leading-relaxed">{comment.content}</p>
        )}

        <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
          <button
            onClick={() => likeComment.mutate(comment._id)}
            className={cn('flex items-center gap-1 hover:text-foreground', liked && 'text-primary')}
          >
            <Heart className={cn('h-3.5 w-3.5', liked && 'fill-current')} /> {comment.likes.length || ''}
          </button>
          {depth === 0 && currentUser && (
            <button onClick={() => setReplying((r) => !r)} className="flex items-center gap-1 hover:text-foreground">
              <Reply className="h-3.5 w-3.5" /> Reply
            </button>
          )}
          {isOwner && (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 hover:text-foreground">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
          {(isOwner || isAdmin) && (
            <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>

        {replying && (
          <div className="mt-3">
            <CommentForm
              autoFocus
              submitLabel="Reply"
              placeholder={`Reply to ${comment.author.name}…`}
              isSubmitting={createComment.isPending}
              onCancel={() => setReplying(false)}
              onSubmit={(content) => {
                createComment.mutate({ content, parentComment: comment._id });
                setReplying(false);
              }}
            />
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div className="mt-3 space-y-3 border-l border-border pl-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} postId={postId} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this comment?"
        description="This will also remove any replies to it. This can't be undone."
        destructive
        confirmLabel="Delete"
        loading={deleteComment.isPending}
        onConfirm={() => {
          deleteComment.mutate(comment._id);
          setConfirmDelete(false);
        }}
      />
    </div>
  );
}

export const CommentItem = memo(CommentItemImpl);
