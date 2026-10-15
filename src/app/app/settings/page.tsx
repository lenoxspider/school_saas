import React from 'react';
import { requireSchoolAdmin } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { School, Building, Mail, Phone, MapPin, Globe, Award, Shield } from 'lucide-react';

export default async function SchoolSettingsPage() {
  const { schoolId } = await requireSchoolAdmin();

  const school = db.getSchoolById(schoolId);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">School Profile & Branding</h2>
        <p className="text-xs text-slate-500 mt-1">
          Customize official school credentials, crest, motto, and contact details stamped on PDF
          report cards.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            {school?.code || 'SCH'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{school?.name}</h3>
            <p className="text-xs text-slate-500">
              Motto: <span className="italic font-serif font-medium">"{school?.motto || 'Excellence & Integrity'}"</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Plan: {school?.plan?.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Status: {school?.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <span className="text-slate-500 block mb-1">Official Email</span>
            <span className="font-semibold text-slate-900 dark:text-white">{school?.email}</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <span className="text-slate-500 block mb-1">Phone Contact</span>
            <span className="font-semibold text-slate-900 dark:text-white">{school?.phone || 'N/A'}</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <span className="text-slate-500 block mb-1">Country & Currency</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {school?.country} ({school?.currency})
            </span>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <span className="text-slate-500 block mb-1">Campus Address</span>
            <span className="font-semibold text-slate-900 dark:text-white">{school?.address || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
