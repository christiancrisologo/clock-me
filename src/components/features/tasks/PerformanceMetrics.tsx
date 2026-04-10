import React from 'react';
import { BarChart3, ChevronDown, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn, formatDuration } from '../../../lib/utils';
import { InfoDialog } from '../../ui/InfoDialog';

interface PerformanceMetricsProps {
  isMinimized: boolean;
  setIsMinimized: (val: boolean) => void;
  totalTimeSpent: number;
  completedTasksCount: number;
  totalTasksCount: number;
  efficiency: number;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  isMinimized,
  setIsMinimized,
  totalTimeSpent,
  completedTasksCount,
  totalTasksCount,
  efficiency
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-brand-600" />
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Performance Metrics</h4>
        </div>
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-[10px] font-bold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-brand-50"
        >
          {isMinimized ? 'Show Metrics' : 'Hide Metrics'}
          <ChevronDown size={14} className={cn("transition-transform duration-300", !isMinimized && "rotate-180")} />
        </button>
      </div>

      {!isMinimized && (
        <div className="p-8 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <Metric 
              icon={<Clock size={28} />} 
              label="Total Time" 
              value={formatDuration(totalTimeSpent)} 
              variant="blue" 
            />
            <Metric 
              icon={<CheckCircle2 size={28} />} 
              label="Completed" 
              value={`${completedTasksCount} / ${totalTasksCount}`} 
              variant="green" 
            />
            <div className="flex items-center gap-5">
              <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                <TrendingUp size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dev Efficiency</p>
                  <InfoDialog 
                    title="Dev Efficiency" 
                    content={
                      <div className="space-y-3">
                        <p>Measures your productivity during active development phases compared to your initial estimates.</p>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Formula</p>
                          <p className="font-mono text-xs text-brand-600">(Σ Estimated Hours / Σ Active Dev Hours) × 100</p>
                        </div>
                        <p className="text-xs text-slate-500">Note: For single tasks, total time is used as dev time. For sprintly tasks, only the "In Progress" phase time is counted.</p>
                      </div>
                    }
                  />
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{(efficiency * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface MetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant: 'blue' | 'green' | 'purple';
}

const Metric: React.FC<MetricProps> = ({ icon, label, value, variant }) => {
  const variants = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="flex items-center gap-5">
      <div className={cn("p-4 rounded-2xl", variants[variant])}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
};
