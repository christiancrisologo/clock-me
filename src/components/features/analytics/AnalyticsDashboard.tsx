import React from 'react';
import { BarChart3, Zap, Share2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Task, Sprint } from '../../../types';
import { InfoDialog } from '../../ui/InfoDialog';
import { HOURS_PER_POINT } from '../../../constants';
import {
  buildSprintChartData,
  computePerformanceMetrics,
  taskDevSeconds,
  taskEstimatedHoursFromPoints,
  taskWaitingSeconds,
} from '../../../utils/metrics';

import { RefreshCw } from 'lucide-react';
import { Button } from '../../ui/Button';

interface AnalyticsDashboardProps {
  sprintTasks: Task[];
  sprints?: Sprint[];
  selectedSprintId?: string;
  onSelectSprint?: (sprintId: string) => void;
  currentSprint?: Sprint;
  onSync: () => void;
  isSyncing: boolean;
  readOnly?: boolean;
  onShare?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  sprintTasks,
  sprints = [],
  selectedSprintId,
  onSelectSprint,
  currentSprint,
  onSync,
  isSyncing,
  readOnly = false,
  onShare
}) => {
  const metrics = computePerformanceMetrics(sprintTasks, ['Ready for QA', 'Code Review']);
  const completedTasks = sprintTasks.filter(t => t.status.toLowerCase() === 'done');
  const chartData = buildSprintChartData(sprintTasks);

  const tableTotals = React.useMemo(() => {
    return sprintTasks.reduce(
      (acc, task) => {
        acc.estimatedPoints += task.estimatedPoints || 0;
        acc.estimatedHours += taskEstimatedHoursFromPoints(task);
        acc.devHours += taskDevSeconds(task) / 3600;
        acc.waitHours += taskWaitingSeconds(task, ['Ready for QA', 'Code Review']) / 3600;
        return acc;
      },
      { estimatedPoints: 0, estimatedHours: 0, devHours: 0, waitHours: 0 }
    );
  }, [sprintTasks]);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 size={18} className="sm:w-5 sm:h-5 text-brand-600" />
              Sprint Time Distribution
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6">
              {onSelectSprint && sprints.length > 0 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="analytics-sprint-filter" className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    Sprint
                  </label>
                  <select
                    id="analytics-sprint-filter"
                    value={selectedSprintId || ''}
                    onChange={(event) => onSelectSprint(event.target.value)}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs sm:text-sm font-semibold text-slate-700"
                  >
                    {sprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {!readOnly && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onSync}
                  disabled={isSyncing}
                  className="gap-2 text-[9px] sm:text-xs font-bold border-slate-200 h-9 sm:h-auto"
                >
                  <RefreshCw size={12} className={cn(isSyncing ? 'animate-spin' : '', 'sm:w-3.5 sm:h-3.5')} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              )}

              {!readOnly && onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShare}
                  className="gap-2 text-[9px] sm:text-xs font-bold border-slate-200 h-9 sm:h-auto"
                >
                  <Share2 size={12} className="sm:w-3.5 sm:h-3.5" />
                  Share Dashboard
                </Button>
              )}
              <div className="flex gap-3 sm:gap-4">
                <span className="flex items-center gap-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" /> Actual
                </span>
                <span className="flex items-center gap-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" /> Estimated
                </span>
              </div>
            </div>
          </div>
          <div className="h-64 sm:h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="dev" name="Dev Time" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} barSize={20} />
                <Bar dataKey="wait" name="Wait Time" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="estimated" name="Estimated" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base">
            <Zap size={18} className="sm:w-5 sm:h-5 text-amber-500" />
            Sprint Efficiency
            <InfoDialog 
              title="Sprint Efficiency" 
              content={
                <div className="space-y-2">
                  <p>The ratio of total estimated hours to total development hours spent across all completed tasks in this sprint.</p>
                  <p>A ratio of 1.0 means you are exactly on estimate.</p>
                </div>
              }
            />
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <circle
                  cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent"
                  strokeDasharray={502.4}
                  strokeDashoffset={502.4 * (1 - Math.min(1, metrics.devEfficiency / 2))}
                  className="text-brand-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-4xl font-black text-slate-900">{metrics.devEfficiency.toFixed(1)}</span>
                <span className="text-[8px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Ratio</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 md:mt-8 text-center px-2">
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Dev efficiency uses <span className="font-bold text-slate-900">estimated points x {HOURS_PER_POINT}</span> against dev hours.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Completed-only ratio: <span className="font-bold text-slate-700">{metrics.completedDevEfficiency.toFixed(1)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-4">
        <StatCard 
          label="Estimated Scope" 
          value={metrics.totalEstimatedPoints.toFixed(1)} 
          suffix="pts" 
          subtext={`Total estimated points in ${currentSprint?.name}`} 
        />
        <StatCard 
          label="Completed Tasks" 
          value={completedTasks.length.toString()} 
          suffix={`/ ${sprintTasks.length}`} 
          subtext="How many tasks are completed" 
        />
        <StatCard 
          label="Total Dev Work" 
          value={metrics.totalDevHours.toFixed(1)} 
          suffix="hrs" 
          subtext="Development hours logged" 
        />
        <StatCard 
          label="Dev vs Estimate" 
          value={`${metrics.totalDevHours.toFixed(1)}h / ${metrics.totalEstimatedHoursFromPoints.toFixed(1)}h`}
          subtext={`Completed dev: ${metrics.completedDevHours.toFixed(1)}h / ${metrics.completedEstimatedHoursFromPoints.toFixed(1)}h`} 
        />
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Sprint Task Summary</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            {currentSprint?.name || 'Selected sprint'}: {sprintTasks.length} tasks scoped to this sprint
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Task</th>
                <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="text-right px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Pts</th>
                <th className="text-right px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Hours</th>
                <th className="text-right px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Dev Work (hrs)</th>
                <th className="text-right px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Wait (hrs)</th>
              </tr>
            </thead>
            <tbody>
              {sprintTasks.map((task) => {
                const estimatedHours = taskEstimatedHoursFromPoints(task);
                const devHours = taskDevSeconds(task) / 3600;
                const waitHours = taskWaitingSeconds(task, ['Ready for QA', 'Code Review']) / 3600;

                return (
                  <tr key={task.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{task.jiraId || task.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{task.status}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-right">{(task.estimatedPoints || 0).toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-right">{estimatedHours.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-right">{devHours.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-right">{waitHours.toFixed(2)}</td>
                  </tr>
                );
              })}

              {sprintTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                    No tasks found for this sprint.
                  </td>
                </tr>
              )}
            </tbody>
            {sprintTasks.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td className="px-4 py-3 text-sm font-black text-slate-900">Totals</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">
                    {completedTasks.length} done / {sprintTasks.length} tasks
                  </td>
                  <td className="px-4 py-3 text-sm font-black text-slate-900 text-right">{tableTotals.estimatedPoints.toFixed(1)}</td>
                  <td className="px-4 py-3 text-sm font-black text-slate-900 text-right">{tableTotals.estimatedHours.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-black text-slate-900 text-right">{tableTotals.devHours.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-black text-slate-900 text-right">{tableTotals.waitHours.toFixed(2)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Personal Productivity Metrics</h3>
          <p className="text-xs sm:text-sm text-slate-500">Individual performance framework (IPS, RI, FF)</p>
        </div>
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* IPS Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">IPS</p>
              <p className="text-xs text-blue-700 font-semibold mb-3">Productivity Score</p>
              <p className="text-2xl sm:text-3xl font-black text-blue-900">{metrics.ips.toFixed(2)}</p>
              <p className="text-[9px] text-blue-600 mt-2">(Pts Completed / Pts Est.) × Efficiency</p>
              <div className="mt-3 text-[8px] text-blue-700 space-y-1 bg-blue-100/40 rounded p-2">
                <p>Completed: {metrics.completedEstimatedPoints.toFixed(0)} / {metrics.totalEstimatedPoints.toFixed(0)} pts</p>
                <p>Dev Efficiency: {metrics.devEfficiency.toFixed(2)}x</p>
              </div>
            </div>

            {/* RI Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">RI</p>
              <p className="text-xs text-green-700 font-semibold mb-3">Reliability Index</p>
              <p className="text-2xl sm:text-3xl font-black text-green-900">{metrics.ri.toFixed(1)}%</p>
              <p className="text-[9px] text-green-600 mt-2">(Pts Completed / Pts Planned) × 100</p>
              <div className="mt-3 text-[8px] text-green-700 space-y-1 bg-green-100/40 rounded p-2">
                <p>Target: 90%+</p>
                <p className="font-semibold">{metrics.ri >= 90 ? '✓ On Track' : '⚠ Below Target'}</p>
              </div>
            </div>

            {/* FF Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
              <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">FF</p>
              <p className="text-xs text-purple-700 font-semibold mb-3">Focus Factor</p>
              <p className="text-2xl sm:text-3xl font-black text-purple-900">{(metrics.ff * 100).toFixed(0)}%</p>
              <p className="text-[9px] text-purple-600 mt-2">Dev Hours / 40-hour shift</p>
              <div className="mt-3 text-[8px] text-purple-700 space-y-1 bg-purple-100/40 rounded p-2">
                <p>Dev Hours: {metrics.totalDevHours.toFixed(1)} hrs</p>
                <p>Meetings: {((1 - metrics.ff) * 40).toFixed(1)} hrs</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Metrics Framework</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[9px] text-slate-600">
              <div>
                <p className="font-semibold text-slate-700 mb-2">IPS Interpretation:</p>
                <ul className="space-y-1 text-slate-600">
                  <li>• &gt; 1.0: High performer, exceeding targets</li>
                  <li>• = 1.0: Predictable, on estimate</li>
                  <li>• &lt; 0.8: Under-performer or blocked</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-2">Key Insights:</p>
                <ul className="space-y-1 text-slate-600">
                  <li>• RI measures sprint commitment accuracy</li>
                  <li>• FF reveals meeting/distraction impact</li>
                  <li>• Combined: holistic productivity view</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, suffix, subtext }: { label: string, value: string, suffix?: string, subtext: string }) => (
  <div className="bg-white p-3 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
    <p className="text-[8px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">{label}</p>
    <p className="text-lg sm:text-3xl font-black text-slate-900">
      {value}
      {suffix && <span className="text-xs sm:text-sm font-medium text-slate-400 ml-0.5 sm:ml-1">{suffix}</span>}
    </p>
    <p className="text-[8px] sm:text-xs text-slate-500 mt-1 sm:mt-2 leading-tight sm:leading-relaxed">{subtext}</p>
  </div>
);
