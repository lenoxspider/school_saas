import React from 'react';
import Link from 'next/link';
import {
  School,
  FileSpreadsheet,
  Zap,
  ShieldCheck,
  Award,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              <School className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Scholar<span className="text-blue-500">Grid</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-md shadow-blue-600/30"
            >
              Onboard School
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            Next-Gen Academic Results & Report Card Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Enter 400 students’ marks.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
              Generate all report cards in 30 seconds.
            </span>
          </h1>

          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            A fast, multi-tenant academic management platform built for modern schools. Eliminate
            spreadsheet chaos, calculate weighted continuous assessments, and generate professional
            PDF report cards and broadsheets with zero lag.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30"
            >
              Launch Live App Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all"
            >
              Register New School (30-day Free Trial)
            </Link>
          </div>
        </section>

        {/* Demo Credentials Quick-Access Card */}
        <section className="max-w-4xl mx-auto px-6 mb-16">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" /> Instant Demo Accounts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">School Admin</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300">
                    Accra Academy
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-300 mt-2">admin@accraacademy.edu.gh</p>
                <p className="text-xs font-mono text-slate-500">Password123!</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Class Teacher</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">
                    Basic 7 Math
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-300 mt-2">
                  kwame.asante@accraacademy.edu.gh
                </p>
                <p className="text-xs font-mono text-slate-500">Teacher123!</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">Super Admin</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">
                    Platform Owner
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-300 mt-2">
                  superadmin@schoolplatform.com
                </p>
                <p className="text-xs font-mono text-slate-500">Password123!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-800">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white">Built Specifically for Academic Workflows</h2>
            <p className="text-xs text-slate-400 mt-2">
              Engineered for speed, data fidelity, and strict tenant security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Keyboard-Speed Score Entry</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Spreadsheet interface with arrow-key navigation, Tab cycling, instant formula
                calculations, max score validation, and auto-draft saving.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Configurable Grading & Ranking</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Support for 40/60, 30/70 or custom weighted components, standard competition ties (1,
                2, 2, 4), and immutable calculation snapshots.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40">
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Instant PDFs & Broadsheets</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Generate official terminal report cards with school crests, full class Excel
                broadsheets, and bulk ZIP archives with deterministic file names.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 ScholarGrid SaaS Platform. Multi-Tenant Academic Engine.</p>
      </footer>
    </div>
  );
}
