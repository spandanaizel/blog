import { Link } from 'react-router-dom';
import { Users, FileText, MessageSquare, Bookmark, Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { useAdminAnalytics } from '@/hooks/useAnalytics';

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return <QueryErrorState title="Couldn't load admin overview" onRetry={() => refetch()} />;
  }

  const statCards = [
    { label: 'Total users', value: stats.usersCount, icon: Users },
    { label: 'Published posts', value: stats.postsCount, icon: FileText },
    { label: 'Draft posts', value: stats.draftCount, icon: FileText },
    { label: 'Total views', value: stats.totalViews, icon: Eye },
    { label: 'Total comments', value: stats.totalComments, icon: MessageSquare },
    { label: 'Total bookmarks', value: stats.totalBookmarks, icon: Bookmark },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin overview</h1>
      <p className="text-muted-foreground">Platform-wide health at a glance.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex flex-col gap-2 p-4">
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Top posts platform-wide
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No published posts yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.topPosts.map((post, i) => (
                  <Link
                    key={post._id}
                    to={`/blog/${post.slug}`}
                    className="flex items-center justify-between gap-3 rounded-md p-2 text-sm hover:bg-accent"
                  >
                    <span className="flex items-center gap-3 truncate">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span className="truncate font-medium">{post.title}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{post.views} views</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top authors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.topAuthors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No authors yet.</p>
            ) : (
              stats.topAuthors.map((author) => (
                <Link
                  key={author._id}
                  to={`/authors/${author.username}`}
                  className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-accent"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={author.avatar} alt={author.name} />
                      <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm font-medium">{author.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{author.followersCount} followers</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Detailed moderation tools live under <strong className="text-foreground">Users</strong> and{' '}
        <strong className="text-foreground">Posts</strong>; deeper trend charts are under{' '}
        <strong className="text-foreground">Analytics</strong> in the sidebar.
      </p>
    </div>
  );
}
