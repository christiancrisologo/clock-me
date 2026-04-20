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
  totalEstimatedHoursFromPoints: number;
  totalDevHours: number;
  totalWaitingHours: number;
  devEfficiency: number;
  waitAdjustedEfficiency: number;
  includeWaitingHours?: boolean;
  onToggleWaiting?: (val: boolean) => void;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  isMinimized,
  setIsMinimized,
  totalTimeSpent,
  completedTasksCount,
  totalTasksCount,
  totalEstimatedHoursFromPoints,
  totalDevHours,
  totalWaitingHours,
  devEfficiency,
  waitAdjustedEfficiency,
  includeWaitingHours = false,
  onToggleWaiting
}) => {
  const displayedEfficiency = includeWaitingHours ? waitAdjustedEfficiency : devEfficiency;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-slate-50/50 gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="sm:w-5 sm:h-5 text-brand-600" />
          <h4 className="text-[10px] sm:text-xs font-black text-slate-700 uppercase tracking-widest">Performance Metrics</h4>
        </div>
        <div className="flex items-center gap-3">
          {onToggleWaiting && (
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={includeWaitingHours}
                onChange={(e) => onToggleWaiting(e.target.checked)}
                className="w-3 h-3 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
              <span className="font-semibold text-slate-700 text-[9px] sm:text-xs">Include Waiting</span>
            </label>
          )}
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-[9px] sm:text-[10px] font-bold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-brand-50 w-fit"
          >
            {isMinimized ? 'Show' : 'Hide'}
            <ChevronDown size={14} className={cn("transition-transform duration-300", !isMinimized && "rotate-180")} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 sm:p-6 md:p-8 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Metric 
              icon={<Clock size={24} className="sm:w-7 sm:h-7" />} 
              label="Total Time" 
              value={formatDuration(totalTimeSpent)} 
              variant="blue" 
            />
            <Metric 
              icon={<CheckCircle2 size={24} className="sm:w-7 sm:h-7" />} 
              label="Completed" 
              value={`${completedTasksCount} / ${totalTasksCount}`} 
              variant="green" 
            />
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="p-3 sm:p-4 bg-purple-50 text-purple-600 rounded-2xl flex-shrink-0">
                <TrendingUp size={24} className="sm:w-7 sm:h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Dev Efficiency</p>
                  <InfoDialog 
                    title="Dev Efficiency" 
                    content={
                      <div className="space-y-3">
                        <p>Measures productivity with estimates converted from points and compared to development time.</p>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Formula</p>
                          <p className="font-mono text-xs text-brand-600">Σ(Estimated Points x Hours/Point) / Σ(Dev Hours)</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Wait-Adjusted</p>
                          <p className="font-mono text-xs text-brand-600">Σ(Estimated Points x Hours/Point) / Σ(Dev Hours + Waiting Hours)</p>
                        </div>
                        <p className="text-xs text-slate-500">Waiting Hours include time in "Ready for QA" and "Code Review" before release readiness.</p>
                      </div>
                    }
                  />
                </div>
              <p className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">{displayedEfficiency.toFixed(2)}</p>
              <p className="text-[9px] sm:text-xs text-slate-500">{includeWaitingHours ? 'Dev + waiting adjusted' : 'Dev-only efficiency'} • Other: {(includeWaitingHours ? devEfficiency : waitAdjustedEfficiency).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 bg-slate-50 rounded-xl border border-slate-100 p-3 sm:p-4">
            <p className="text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Computation Context</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Estimated Hours (From Points)</p>
                <p className="text-sm sm:text-base font-black text-slate-900">{totalEstimatedHoursFromPoints.toFixed(2)}h</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Total Dev Hours</p>
                <p className="text-sm sm:text-base font-black text-slate-900">{totalDevHours.toFixed(2)}h</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Total Waiting Hours</p>
                <p className="text-sm sm:text-base font-black text-slate-900">{totalWaitingHours.toFixed(2)}h</p>
              </div>
            </div>
            <div className="mt-3 text-[10px] sm:text-xs text-slate-600 space-y-1">
              <p className={cn(includeWaitingHours ? '' : 'text-brand-600 font-bold')}>
                Dev-Only: {totalEstimatedHoursFromPoints.toFixed(2)}h / {totalDevHours.toFixed(2)}h = <span className="font-bold">{devEfficiency.toFixed(2)}</span>
              </p>
              <p className={cn(includeWaitingHours ? 'text-brand-600 font-bold' : '')}>
                With Waiting: {totalEstimatedHoursFromPoints.toFixed(2)}h / {(totalDevHours + totalWaitingHours).toFixed(2)}h = <span className="font-bold">{waitAdjustedEfficiency.toFixed(2)}</span>
              </p>
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
    <div className="flex items-center gap-3 sm:gap-5">
      <div className={cn("p-3 sm:p-4 rounded-2xl flex-shrink-0", variants[variant])}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
};
