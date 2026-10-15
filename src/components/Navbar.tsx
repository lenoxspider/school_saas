'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SessionUser } from '@/types';
import { LogOut, School, ShieldAlert, User, Bell } from 'lucide-react';

interface NavbarProps {
  user: SessionUser;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
          <School className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
            {user.schoolName || 'Platform Administration'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user.role === 'SUPER_ADMIN'
              ? 'Global Platform Super Admin'
              : user.role === 'SCHOOL_ADMIN'
              ? 'School Administrator'
              : 'Class & Subject Teacher'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user.role === 'SUPER_ADMIN' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <ShieldAlert className="w-3.5 h-3.5" /> Super Admin Mode
          </span>
        )}

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-medium text-xs">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
