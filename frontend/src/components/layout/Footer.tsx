import { Link } from 'react-router-dom';
import { Feather, Github, Twitter, Linkedin } from 'lucide-react';

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'Trending', to: '/explore?sort=popular' },
      { label: 'Latest', to: '/explore?sort=newest' },
      { label: 'Tags', to: '/tags' },
      { label: 'Categories', to: '/categories' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Authors', to: '/authors' },
      { label: 'Write a post', to: '/dashboard/write' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/' },
      { label: 'Privacy', to: '/' },
      { label: 'Terms', to: '/' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-lg">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Feather className="h-4 w-4" />
            </span>
            Inkwell
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A calmer place to read and write. No noise, just good writing and the people behind it.
          </p>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="GitHub" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border py-5">
        <p className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Inkwell. Built for writers who'd rather write than scroll.
        </p>
      </div>
    </footer>
  );
}
