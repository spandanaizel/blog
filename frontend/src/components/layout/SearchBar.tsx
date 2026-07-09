import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const RECENT_KEY = 'inkwell-recent-searches';

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function pushRecent(term: string) {
  const list = [term, ...getRecent().filter((t) => t !== term)].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

export function SearchBar({ className }: { className?: string }) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRecent(getRecent());
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function runSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    pushRecent(trimmed);
    setOpen(false);
    navigate(`/explore?search=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-md', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch(value)}
          placeholder="Search articles, tags, authors…"
          className="h-9 w-full rounded-full border border-input bg-secondary/60 pl-9 pr-8 text-sm outline-none transition-colors focus:bg-background focus:ring-2 focus:ring-ring"
        />
        {value && (
          <button
            onClick={() => setValue('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && recent.length > 0 && (
        <div className="absolute left-0 right-0 top-11 z-40 rounded-lg border border-border bg-popover p-2 shadow-md">
          <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Recent searches</p>
          {recent.map((term) => (
            <button
              key={term}
              onClick={() => runSearch(term)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
