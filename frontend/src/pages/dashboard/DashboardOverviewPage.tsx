import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { FileText, Eye, Heart, Users, MessageSquare, Bookmark, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { AsyncErrorBoundary } from '@/components/shared/AsyncErrorBoundary';
import { useDashboardAnalytics } from '@/hooks/useAnalytics';
import { useAuthors } from '@/hooks/useUsers';
import { useToggleFollow } from '@/hooks/useBookmarks';
import { useAuthStore } from '@/store/authStore';

const COLORS = ['#2563EB', '#60A5FA', '#93C5FD', '#1D4ED8', '#3B82F6', '#BFDBFE'];

export default function DashboardOverviewPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading, isError, refetch } = useDashboardAnalytics();
  const { data: suggested } = useAuthors({ limit: 6 });
  const toggleFollow = useToggleFollow();

  const peopleToFollow = (suggested?.users ?? []).filter((u) => u.username !== user?.username && !u.isFollowing).slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-lg" />
      </div>
    );
  }

  if (isError || !stats) {
    return <QueryErrorState title="Couldn't load your dashboard" onRetry={() => refetch()} />;
  }

  const statCards = [
    { label: 'Published posts', value: stats.postsCount, icon: FileText },
    { label: 'Draft posts', value: stats.draftCount, icon: FileText },
    { label: 'Total views', value: stats.totalViews, icon: Eye },
    { label: 'Followers', value: stats.followersCount, icon: Users },
    { label: 'Total likes', value: stats.totalLikes, icon: Heart },
    { label: 'Comments', value: stats.totalComments, icon: MessageSquare },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
      <p className="text-muted-foreground">Here's how your writing is performing.</p>

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

      <AsyncErrorBoundary title="Couldn't render your charts">
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Views trend</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {stats.viewsTrend.every((p) => p.value === 0) ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Publish a post to start tracking views
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.viewsTrend}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" name="Views" stroke="#2563EB" fill="url(#viewsGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Posts by category</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {stats.categoryDistribution.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  <Bookmark className="mr-2 h-4 w-4" /> Publish a post to see this chart
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryDistribution}
                      dataKey="count"
                      nameKey="category"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {stats.categoryDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </AsyncErrorBoundary>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Your top posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Publish your first post to see it ranked here.</p>
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
                    <span className="flex shrink-0 gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" /> {post.likesCount}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>People to follow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {peopleToFollow.length === 0 ? (
              <p className="text-sm text-muted-foreground">You're following everyone we'd suggest right now.</p>
            ) : (
              peopleToFollow.map((author) => (
                <div key={author.id} className="flex items-center justify-between gap-2">
                  <Link to={`/authors/${author.username}`} className="flex items-center gap-2 truncate">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={author.avatar} alt={author.name} />
                      <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm font-medium">{author.name}</span>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFollow.mutate({ userId: author.id, following: false })}
                    disabled={toggleFollow.isPending}
                  >
                    Follow
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
