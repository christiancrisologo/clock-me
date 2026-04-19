import React from 'react';
import { BarChart3, Zap, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
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
import { InfoTooltip } from '../../ui/InfoTooltip';

import { RefreshCw } from 'lucide-react';
import { Button } from '../../ui/Button';

interface AnalyticsDashboardProps {
  sprintTasks: Task[];
  currentSprint?: Sprint;
  efficiency: number;
  onSync: () => void;
  isSyncing: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  sprintTasks,
  currentSprint,
  efficiency,
  onSync,
  isSyncing
}) => {
  const totalTimeSpent = sprintTasks.reduce((acc, t) => acc + t.totalSeconds, 0);
  const completedTasks = sprintTasks.filter(t => t.status.toLowerCase() === 'done');

  const chartData = sprintTasks.map(t => {
    const dev = t.classification === 'sprintly' ? (t.phaseSeconds['In progress'] || 0) : t.totalSeconds;
    const wait = t.classification === 'sprintly' ? ((t.phaseSeconds['Code Review'] || 0) + (t.phaseSeconds['Testing'] || 0)) : 0;
    return { 
      name: t.jiraId || t.title.substring(0, 8), 
      dev: Number((dev / 3600).toFixed(2)),
      wait: Number((wait / 3600).toFixed(2)),
      estimated: t.estimatedHours
    };
  });

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
            <InfoTooltip 
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
                  strokeDashoffset={502.4 * (1 - Math.min(1, efficiency / 2))}
                  className="text-brand-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-4xl font-black text-slate-900">{efficiency.toFixed(1)}</span>
                <span className="text-[8px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Ratio</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-6 md:mt-8 text-center px-2">
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Efficiency ratio calculated from <span className="font-bold text-slate-900">{sprintTasks.length}</span> committed tasks.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-4">
        <StatCard 
          label="Sprint Velocity" 
          value={completedTasks.reduce((acc, t) => acc + t.estimatedHours, 0).toString()} 
          suffix="pts" 
          subtext={`Points delivered in ${currentSprint?.name}`} 
        />
        <StatCard 
          label="Sprint Time" 
          value={(totalTimeSpent / 3600).toFixed(1)} 
          suffix="hrs" 
          subtext="Active time for this sprint" 
        />
        <StatCard 
          label="Committed Tasks" 
          value={sprintTasks.length.toString()} 
          subtext="Total tasks in current sprint" 
        />
        <StatCard 
          label="Completion Rate" 
          value={sprintTasks.length > 0 ? Math.round((completedTasks.length / sprintTasks.length) * 100).toString() : '0'} 
          suffix="%" 
          subtext="Tasks finished vs committed" 
        />
      </div>
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
