import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PenSquare,
  FileText,
  Bookmark,
  Bell,
  User,
  Settings,
  ShieldCheck,
  Users,
  FileWarning,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const userLinks = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Write', to: '/dashboard/write', icon: PenSquare },
  { label: 'Drafts', to: '/dashboard/drafts', icon: FileText },
  { label: 'Bookmarks', to: '/dashboard/bookmarks', icon: Bookmark },
  { label: 'Notifications', to: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', to: '/dashboard/profile', icon: User },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
];

const adminLinks = [
  { label: 'Admin overview', to: '/admin', icon: ShieldCheck, end: true },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Posts', to: '/admin/posts', icon: FileWarning },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
];

export function DashboardSidebar({ admin = false }: { admin?: boolean }) {
  const role = useAuthStore((s) => s.user?.role);
  const links = admin ? adminLinks : userLinks;

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border px-3 py-6 lg:block">
      <nav className="flex flex-col gap-1">
        {links.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                isActive && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {!admin && role === 'admin' && (
        <div className="mt-6 border-t border-border pt-4">
          <NavLink
            to="/admin"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ShieldCheck className="h-4 w-4" /> Admin panel
          </NavLink>
        </div>
      )}
    </aside>
  );
}
