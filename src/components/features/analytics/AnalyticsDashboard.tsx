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

interface AnalyticsDashboardProps {
  sprintTasks: Task[];
  currentSprint?: Sprint;
  efficiency: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  sprintTasks,
  currentSprint,
  efficiency
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-brand-600" />
              Sprint Time Distribution
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <div className="w-2 h-2 bg-brand-500 rounded-full" /> Actual
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <div className="w-2 h-2 bg-slate-200 rounded-full" /> Estimated
              </span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="dev" name="Dev Time" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} barSize={32} />
                <Bar dataKey="wait" name="Wait Time" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="estimated" name="Estimated" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Zap size={20} className="text-amber-500" />
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
            <div className="relative w-48 h-48 flex items-center justify-center">
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
                <span className="text-4xl font-black text-slate-900">{efficiency.toFixed(1)}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ratio</span>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500 leading-relaxed">
                Efficiency ratio calculated from <span className="font-bold text-slate-900">{sprintTasks.length}</span> committed tasks.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-900">
      {value}
      {suffix && <span className="text-sm font-medium text-slate-400 ml-1">{suffix}</span>}
    </p>
    <p className="text-xs text-slate-500 mt-2">{subtext}</p>
  </div>
);
