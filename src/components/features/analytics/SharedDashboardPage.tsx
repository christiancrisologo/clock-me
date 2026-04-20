import React from 'react';
import { Clock, Eye, Calendar } from 'lucide-react';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { SharedDashboardSnapshot } from '../../../utils/share';
import { taskDevSeconds } from '../../../utils/metrics';

interface SharedDashboardPageProps {
  snapshot: SharedDashboardSnapshot;
}

export const SharedDashboardPage: React.FC<SharedDashboardPageProps> = ({ snapshot }) => {
  const currentSprint = snapshot.sprints.find((sprint) => sprint.isCurrent) || {
    id: 'shared-all',
    name: 'All Shared Tasks',
    startDate: '',
    endDate: '',
    capacityHours: 0,
    isCurrent: true,
    updatedAt: snapshot.generatedAt,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white">
              <Clock size={20} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">Clock-Me Shared Dashboard</h1>
              <p className="text-xs sm:text-sm text-slate-500">Public read-only snapshot</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
              <Eye size={14} />
              Read-only
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
              <Calendar size={14} />
              {new Date(snapshot.generatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-8">
        <AnalyticsDashboard
          sprintTasks={snapshot.tasks}
          currentSprint={currentSprint}
          onSync={() => undefined}
          isSyncing={false}
          readOnly
        />

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-black text-slate-900">Shared Tasks ({snapshot.tasks.length})</h2>
            <p className="text-xs sm:text-sm text-slate-500">Read-only task summary included in this snapshot</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Task</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Sprint</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Pts</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Dev Hours</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.tasks.map((task) => (
                  <tr key={task.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{task.jiraId || task.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{task.status}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{task.sprintName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-right">{task.estimatedPoints || 0}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-right">{(taskDevSeconds(task) / 3600).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-right">{(task.totalSeconds / 3600).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};