import React from 'react';
import { requireTenant } from '@/lib/auth/guards';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

export default async function TenantAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireTenant();

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
