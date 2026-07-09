import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Users } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/blog/PostCard';
import { PostListSkeleton } from '@/components/shared/Skeletons';
import { Button } from '@/components/ui/button';
import { TagPill } from '@/components/blog/TagPill';
import { useAuthStore } from '@/store/authStore';

const POPULAR_TAGS = ['javascript', 'react', 'ai', 'career', 'webdev', 'productivity', 'design', 'python'];

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: trending, isLoading: trendingLoading } = usePosts({ sort: 'popular', limit: 3 });
  const { data: latest, isLoading: latestLoading } = usePosts({ sort: 'newest', limit: 6 });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Now in open beta
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Read. Write. <span className="text-primary">Connect.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground sm:text-lg">
              Inkwell is a calmer corner of the internet for people who still believe in long-form writing
              and the conversations it starts.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to={isAuthenticated ? '/dashboard/write' : '/register'}>
                  Start writing <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/explore">Explore stories</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </section>

      <div className="container space-y-16 py-14">
        {/* Trending */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <TrendingUp className="h-5 w-5 text-primary" /> Trending this week
            </h2>
            <Link to="/explore?sort=popular" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {trendingLoading ? (
            <PostListSkeleton count={3} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {trending?.posts.map((post, i) => <PostCard key={post._id} post={post} index={i} />)}
            </div>
          )}
        </section>

        {/* Popular tags */}
        <section>
          <h2 className="mb-5 text-xl font-bold">Popular tags</h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.map((tag) => (
              <TagPill key={tag} tag={tag} className="px-4 py-2 text-sm" />
            ))}
          </div>
        </section>

        {/* Latest */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Latest stories</h2>
            <Link to="/explore?sort=newest" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {latestLoading ? (
            <PostListSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest?.posts.map((post, i) => <PostCard key={post._id} post={post} index={i} />)}
            </div>
          )}
        </section>

        {/* Newsletter */}
        <section className="rounded-lg border border-border bg-card p-8 text-center sm:p-12">
          <Users className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-4 text-2xl font-bold">Get the best of Inkwell in your inbox</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            One email a week. The stories worth your time, picked by editors — never an algorithm.
          </p>
          <form
            className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="h-11 flex-1 rounded-md border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="lg">
              Subscribe
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
