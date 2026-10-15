import React from 'react';
import { requireSchoolAdmin } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { Users, Mail, Phone, BookOpen, ShieldCheck, Plus } from 'lucide-react';

export default async function TeachersPage() {
  const { schoolId } = await requireSchoolAdmin();

  const teachers = db.getUsers(schoolId).filter((u) => u.role === 'TEACHER');
  const assignments = db.getTeacherAssignments(schoolId);
  const classes = db.getClasses(schoolId);
  const subjects = db.getSubjects(schoolId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Teaching Faculty</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage teacher accounts, class teacher roles, and subject teaching assignments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => {
          const teacherAssignments = assignments.filter((a) => a.userId === teacher.id);

          return (
            <div
              key={teacher.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-sm">
                  {teacher.firstName[0]}
                  {teacher.lastName[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {teacher.firstName} {teacher.lastName}
                  </h3>
                  <p className="text-xs text-slate-500">{teacher.email}</p>
                </div>
              </div>

              <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{teacher.phone || 'No phone recorded'}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Assigned Classes & Subjects
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {teacherAssignments.map((a) => {
                    const cls = classes.find((c) => c.id === a.classId);
                    const subj = subjects.find((s) => s.id === a.subjectId);
                    return (
                      <span
                        key={a.id}
                        className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      >
                        {cls?.name}: {subj ? subj.code : 'Class Teacher'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
