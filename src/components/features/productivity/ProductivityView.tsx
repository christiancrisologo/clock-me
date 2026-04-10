import React from 'react';
import { TrendingUp, Clock, Zap } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { Task } from '../../../types';
import { InfoTooltip } from '../../ui/InfoTooltip';

interface ProductivityViewProps {
  tasks: Task[];
  period: 'day' | 'week' | 'month';
}

export const ProductivityView: React.FC<ProductivityViewProps> = ({ tasks, period }) => {
  const chartData = (() => {
    const grouped: Record<string, { name: string, devHours: number, waitHours: number, points: number }> = {};
    tasks.forEach(t => {
      const date = new Date(t.createdAt);
      let key = '';
      if (period === 'day') key = format(date, 'MMM dd');
      else if (period === 'week') key = `Week ${format(date, 'w')}`;
      else key = format(date, 'MMM yyyy');
      
      if (!grouped[key]) grouped[key] = { name: key, devHours: 0, waitHours: 0, points: 0 };
      
      const dev = t.classification === 'sprintly' ? (t.phaseSeconds['In progress'] || 0) : t.totalSeconds;
      const wait = t.classification === 'sprintly' ? ((t.phaseSeconds['Code Review'] || 0) + (t.phaseSeconds['Testing'] || 0)) : 0;
      
      grouped[key].devHours += dev / 3600;
      grouped[key].waitHours += wait / 3600;
      if (t.status.toLowerCase() === 'done') grouped[key].points += t.estimatedPoints;
    });
    return Object.values(grouped);
  })();

  const topPerformingTasks = [...tasks]
    .filter(t => t.status.toLowerCase() === 'done' && t.totalSeconds > 0)
    .sort((a, b) => {
      const aEff = a.estimatedHours / (a.totalSeconds / 3600);
      const bEff = b.estimatedHours / (b.totalSeconds / 3600);
      return bEff - aEff;
    })
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-brand-600" />
          Productivity Trend ({period})
          <InfoTooltip 
            title="Productivity Trend" 
            content={
              <div className="space-y-2">
                <p>Visualizes your development hours, waiting hours, and total points delivered over the selected period.</p>
              </div>
            }
          />
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="devHours" name="Dev Hours" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} barSize={40} />
              <Bar dataKey="waitHours" name="Wait Hours" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="points" name="Points Delivered" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4">Top Performing Tasks</h4>
          <div className="space-y-4">
            {topPerformingTasks.map((task, i) => {
              const efficiency = (task.estimatedHours / (task.totalSeconds / 3600)) * 100;
              return (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 text-[10px] font-black flex items-center justify-center">#{i + 1}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{task.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{task.jiraId || 'No JIRA ID'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-brand-600">{efficiency.toFixed(0)}%</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black uppercase tracking-widest">Efficiency</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4">Productivity Highlights</h4>
          <div className="space-y-4">
            <HighlightItem 
              icon={<Clock size={18} />} 
              label="Weekly Average Time" 
              value={`${(tasks.reduce((acc, t) => acc + t.totalSeconds, 0) / (tasks.length || 1) / 3600).toFixed(1)}h`} 
            />
            <HighlightItem 
              icon={<Zap size={18} />} 
              label="Best Efficiency" 
              value={topPerformingTasks.length > 0 ? `${((topPerformingTasks[0].estimatedHours / (topPerformingTasks[0].totalSeconds / 3600)) * 100).toFixed(0)}%` : 'N/A'} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const HighlightItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
    <div className="flex items-center gap-3 text-slate-500">
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
    <span className="text-sm font-black text-slate-900">{value}</span>
  </div>
);
