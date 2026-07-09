import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

export function DashboardLayout({ admin = false }: { admin?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex flex-1 gap-8 py-6">
        <DashboardSidebar admin={admin} />
        <main className="min-w-0 flex-1 pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
