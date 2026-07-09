import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function TagPill({ tag, className }: { tag: string; className?: string }) {
  return (
    <Link
      to={`/tags/${tag}`}
      className={cn(
        'inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary',
        className
      )}
    >
      #{tag}
    </Link>
  );
}
