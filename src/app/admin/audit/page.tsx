import { requireSuperAdmin } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { GlobalAuditTableClient } from '@/components/GlobalAuditTableClient';

export default async function AdminGlobalAuditPage() {
  await requireSuperAdmin();

  const logs = db.getAuditLogs(undefined, 200); // Global across all schools
  const schools = db.getSchools();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Global Audit & Event Trail</h2>
          <p className="text-xs text-slate-400 mt-1">
            Master immutable log of all tenant activity, user authentication, score submissions, administrative approvals, and system mutations.
          </p>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {logs.length} Recorded Global Events
        </span>
      </div>

      <GlobalAuditTableClient initialLogs={logs} schools={schools} />
    </div>
  );
}
