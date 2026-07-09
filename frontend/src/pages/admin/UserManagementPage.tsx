import { useState } from 'react';
import { ShieldCheck, ShieldOff, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { PostListSkeleton } from '@/components/shared/Skeletons';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useAuthors } from '@/hooks/useUsers';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useUpdateUserRole } from '@/hooks/useAdmin';
import { useAuthStore } from '@/store/authStore';
import type { PublicUser } from '@/types';

export default function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const { data, isLoading, isError, refetch } = useAuthors({ page, limit: 10, search: debouncedSearch || undefined });
  const updateRole = useUpdateUserRole();
  const currentUser = useAuthStore((s) => s.user);
  const [pendingTarget, setPendingTarget] = useState<PublicUser | null>(null);

  function requestRoleChange(user: PublicUser) {
    setPendingTarget(user);
  }

  function confirmRoleChange() {
    if (!pendingTarget) return;
    const nextRole = pendingTarget.role === 'admin' ? 'user' : 'admin';
    updateRole.mutate({ userId: pendingTarget.id, role: nextRole });
    setPendingTarget(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-muted-foreground">Manage member accounts and roles.</p>

      <div className="relative mt-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or username"
          className="pl-9"
        />
      </div>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <PostListSkeleton count={4} />
        ) : isError ? (
          <QueryErrorState title="Couldn't load users" onRetry={() => refetch()} />
        ) : !data?.users.length ? (
          <EmptyState title="No users found" />
        ) : (
          data.users.map((u) => {
            const isSelf = u.username === currentUser?.username;
            return (
              <Card key={u.id}>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.avatar} alt={u.name} />
                      <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {u.name} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        u.role === 'admin'
                          ? 'rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'
                          : 'rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground'
                      }
                    >
                      {u.role}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => requestRoleChange(u)}
                      disabled={isSelf || updateRole.isPending}
                      title={isSelf ? "You can't change your own role" : undefined}
                    >
                      {u.role === 'admin' ? (
                        <>
                          <ShieldOff className="h-4 w-4" /> Revoke admin
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" /> Make admin
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {data?.meta && <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} className="mt-8" />}

      <ConfirmDialog
        open={Boolean(pendingTarget)}
        onOpenChange={(open) => !open && setPendingTarget(null)}
        title={pendingTarget?.role === 'admin' ? 'Revoke admin access?' : 'Grant admin access?'}
        description={
          pendingTarget?.role === 'admin'
            ? `${pendingTarget?.name} will lose access to the admin panel.`
            : `${pendingTarget?.name} will gain full access to the admin panel, including post moderation and user management.`
        }
        confirmLabel={pendingTarget?.role === 'admin' ? 'Revoke access' : 'Grant access'}
        destructive={pendingTarget?.role === 'admin'}
        loading={updateRole.isPending}
        onConfirm={confirmRoleChange}
      />
    </div>
  );
}
