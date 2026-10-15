'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SessionUser } from '@/types';
import {
  LayoutDashboard,
  Calendar,
  Users,
  GraduationCap,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  History,
  Settings,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  user: SessionUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const tenantNavItems = [
    { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { label: 'Academic Structure', href: '/app/academic', icon: Calendar, adminOnly: true },
    { label: 'Teachers & Staff', href: '/app/teachers', icon: Users, adminOnly: true },
    { label: 'Students Registry', href: '/app/students', icon: GraduationCap },
    { label: 'Score Entry Grid', href: '/app/scores', icon: Calculator },
    { label: 'Approvals & Review', href: '/app/approvals', icon: CheckCircle2, adminOnly: true },
    { label: 'Reports & Broadsheets', href: '/app/reports', icon: FileSpreadsheet },
    { label: 'Audit Trail', href: '/app/audit', icon: History, adminOnly: true },
    { label: 'School Settings', href: '/app/settings', icon: Settings, adminOnly: true },
  ];

  const superAdminNavItems = [
    { label: 'Platform Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Schools & Tenants', href: '/admin/schools', icon: Building2 },
    { label: 'Platform Security', href: '/admin/security', icon: ShieldCheck },
    { label: 'Global Audit Logs', href: '/admin/audit', icon: History },
  ];

  const items = isSuperAdmin ? superAdminNavItems : tenantNavItems;

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex flex-col min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        {items.map((item) => {
          // If teacher, skip admin-only items
          if ('adminOnly' in item && item.adminOnly && user.role === 'TEACHER') {
            return null;
          }

          const isActive = pathname === item.href || (item.href !== '/app' && item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="px-3 py-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">Fast Academic Results</p>
          <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
            Production Multi-Tenant Engine v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
