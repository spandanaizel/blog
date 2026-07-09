import { Link, NavLink } from 'react-router-dom';
import { Menu, PenSquare, Feather } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/layout/SearchBar';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { UserMenu } from '@/components/layout/UserMenu';
import { NotificationDropdown } from '@/components/layout/NotificationDropdown';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

const links = [
  { label: 'Explore', to: '/explore' },
  { label: 'Tags', to: '/tags' },
  { label: 'Categories', to: '/categories' },
  { label: 'Authors', to: '/authors' },
];

export function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Feather className="h-[18px] w-[18px]" />
          </span>
          Inkwell
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                  isActive && 'text-foreground'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link to="/dashboard/write">
                  <PenSquare className="h-4 w-4" /> Write
                </Link>
              </Button>
              <NotificationDropdown />
              <ThemeToggle />
              <UserMenu />
            </>
          ) : (
            <>
              <ThemeToggle />
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}

          <button
            className="rounded-md p-2 hover:bg-accent md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MobileMenu />
    </header>
  );
}
