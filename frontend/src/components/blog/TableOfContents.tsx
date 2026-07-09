import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ contentRef }: { contentRef: React.RefObject<HTMLElement> }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const nodes = Array.from(container.querySelectorAll('h2, h3')) as HTMLElement[];
    const built: Heading[] = nodes.map((node, idx) => {
      const id = node.id || `heading-${idx}`;
      node.id = id;
      return { id, text: node.textContent || '', level: node.tagName === 'H2' ? 2 : 3 };
    });
    setHeadings(built);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [contentRef]);

  if (headings.length < 2) return null;

  return (
    <nav className="sticky top-24 hidden max-h-[70vh] overflow-y-auto lg:block">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
      <ul className="space-y-2 border-l border-border pl-3">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'ml-3' : ''}>
            <a
              href={`#${h.id}`}
              className={cn(
                'block text-sm text-muted-foreground transition-colors hover:text-foreground',
                activeId === h.id && 'font-medium text-primary'
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
