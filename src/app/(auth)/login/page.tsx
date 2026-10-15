'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { School, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push(data.redirectUrl || '/app');
      router.refresh();
    } catch (err: unknown) {
      setError(String(err).replace('Error: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold mx-auto shadow-lg shadow-blue-600/30">
            <School className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to ScholarGrid</h2>
          <p className="text-xs text-slate-400">
            Access your school dashboard or platform administration portal.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.edu.gh"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* 1-Click Demo Fillers */}
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">
              1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@accraacademy.edu.gh', 'Password123!')}
                className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-[10px] text-slate-300 transition-colors text-center"
              >
                <span className="block font-bold text-blue-400">School Admin</span>
                Accra Acad.
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFill('kwame.asante@accraacademy.edu.gh', 'Teacher123!')
                }
                className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-[10px] text-slate-300 transition-colors text-center"
              >
                <span className="block font-bold text-emerald-400">Teacher</span>
                Math (JHS 1)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFill('superadmin@schoolplatform.com', 'Password123!')
                }
                className="p-2 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-[10px] text-slate-300 transition-colors text-center"
              >
                <span className="block font-bold text-amber-400">Super Admin</span>
                Platform
              </button>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <p className="text-center text-xs text-slate-500">
          Want to register a new school?{' '}
          <Link href="/register" className="text-blue-400 hover:underline font-semibold">
            Onboard here
          </Link>
        </p>
      </div>
    </div>
  );
}
