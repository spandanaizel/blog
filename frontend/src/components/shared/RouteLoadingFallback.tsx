import { Skeleton } from '@/components/ui/skeleton';

export function RouteLoadingFallback() {
  return (
    <div className="container py-10">
      <Skeleton className="h-8 w-64" />
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
