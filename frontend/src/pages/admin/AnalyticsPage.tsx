import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { AsyncErrorBoundary } from '@/components/shared/AsyncErrorBoundary';
import { useAdminAnalytics } from '@/hooks/useAnalytics';

const COLORS = ['#2563EB', '#60A5FA', '#93C5FD', '#1D4ED8', '#3B82F6', '#BFDBFE'];

export default function AnalyticsPage() {
  const { data: stats, isLoading, isError, refetch } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return <QueryErrorState title="Couldn't load analytics" onRetry={() => refetch()} />;
  }

  // Merge likes + comments trends (same month labels from the backend) into one dataset for the combined line chart.
  const engagementData = stats.monthlyActivity.map((m, i) => ({
    month: m.month,
    likes: stats.likesTrend[i]?.value ?? 0,
    comments: stats.commentsTrend[i]?.value ?? 0,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="text-muted-foreground">Platform-wide growth and engagement trends.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <AsyncErrorBoundary title="Couldn't render this chart">
        <Card>
          <CardHeader>
            <CardTitle>Posts published per month</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {stats.monthlyActivity.every((m) => m.posts === 0) ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No posts published yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="posts" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement over time</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {engagementData.every((d) => d.likes === 0 && d.comments === 0) ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No engagement recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="likes" stroke="#2563EB" strokeWidth={2} />
                  <Line type="monotone" dataKey="comments" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
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
                No categorized posts yet
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

        <Card>
          <CardHeader>
            <CardTitle>New followers per month</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {stats.followersTrend.every((p) => p.value === 0) ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No new follows recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.followersTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" name="New followers" fill="#1D4ED8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </AsyncErrorBoundary>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Views and likes trends are bucketed by each post's creation month (a proxy, since individual view/like
        events aren't timestamped) — followers, bookmarks, and comments trends reflect exact historical dates.
      </p>
    </div>
  );
}
