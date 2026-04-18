import React from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Pause, 
  Play, 
  Pencil, 
  Trash2, 
  Target, 
  Clock, 
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatTimeDisplay, formatDuration } from '../../../lib/utils';
import { Task } from '../../../types';
import { TASK_STATUSES } from '../../../constants';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { InfoDialog } from '../../ui/InfoDialog';

interface TaskCardProps {
  task: Task;
  isActive: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onToggleTimer: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isActive,
  isExpanded,
  onToggleExpand,
  onToggleTimer,
  onUpdateStatus,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect
}) => {
  const isDone = task.status.toLowerCase() === 'done';
  const devSec = task.classification === 'sprintly' ? (task.phaseSeconds['In progress'] || 0) : task.totalSeconds;
  const waitSec = task.classification === 'sprintly' ? ((task.phaseSeconds['Code Review'] || 0) + (task.phaseSeconds['Testing'] || 0)) : 0;
  
  const totalEfficiency = ((task.estimatedHours / (task.totalSeconds / 3600 || 1)) * 100).toFixed(0);
  const devEfficiency = ((task.estimatedHours / (devSec / 3600 || 1)) * 100).toFixed(0);
  const waitingImpact = (1 - (task.estimatedHours / (task.totalSeconds / 3600 || 1)) / (task.estimatedHours / (devSec / 3600 || 1))) * 100;

  return (
    <div 
      className={cn(
        "rounded-xl border transition-all duration-300 group overflow-hidden",
        isDone ? "bg-slate-50/50 border-slate-100 opacity-80" : "bg-white border-slate-200 hover:border-brand-200 shadow-sm",
        isActive && "border-brand-500 ring-4 ring-brand-50 bg-white opacity-100"
      )}
    >
      {/* Compact Header */}
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={onToggleSelect}
              disabled={isActive}
              className={cn(
                "w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 transition-all",
                isActive ? "opacity-20 cursor-not-allowed" : "cursor-pointer hover:border-brand-400"
              )}
            />
            <button 
              onClick={() => onToggleExpand(task.id)}
              className="text-slate-400 hover:text-brand-600 transition-colors"
            >
              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-brand-700 transition-colors">
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={isDone ? 'success' : task.status.toLowerCase().includes('progress') ? 'info' : 'default'}>
                {task.status}
              </Badge>
              <Badge variant={task.classification === 'sprintly' ? 'purple' : 'default'}>
                {task.classification}
              </Badge>
              {task.jiraId && !isExpanded && (
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[80px]">
                  {task.jiraId}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
          <div className="text-right">
            <p className={cn(
              "text-2xl font-mono font-black tracking-tighter leading-none",
              isActive ? "text-brand-600" : "text-slate-900"
            )}>
              {formatTimeDisplay(task.totalSeconds)}
            </p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Time Spent</p>
          </div>

          <div className="flex items-center gap-1.5">
            <select 
              value={task.status}
              disabled={isActive}
              onChange={(e) => onUpdateStatus(task.id, e.target.value)}
              className={cn(
                "text-[10px] font-bold border border-slate-200 rounded-md px-2 py-1 bg-white outline-none focus:border-brand-500 hidden sm:block transition-opacity",
                isActive && "opacity-50 cursor-not-allowed"
              )}
            >
              {TASK_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {!isDone && (
              <Button 
                variant={isActive ? 'amber' : 'primary'}
                size="icon"
                onClick={() => onToggleTimer(task.id)}
              >
                {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </Button>
            )}
            
            <Button variant="outline" size="icon-sm" onClick={() => onEdit(task)} title="Edit Task">
              <Pencil size={16} />
            </Button>

            <Button 
              variant="danger" 
              size="icon-sm" 
              onClick={() => onDelete(task.id)} 
              title="Delete Task"
              disabled={isActive}
              className={isActive ? "opacity-30 cursor-not-allowed" : ""}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-50 bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                {task.jiraId && (
                  <div className="bg-white px-2 py-1 rounded border border-slate-200">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">JIRA ID</p>
                    <p className="text-xs font-bold text-slate-700">{task.jiraId}</p>
                  </div>
                )}
                <div className="bg-white px-2 py-1 rounded border border-slate-200">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Type</p>
                  <p className="text-xs font-bold text-brand-600">{task.type}</p>
                </div>
                {task.sprintName && (
                  <div className="bg-white px-2 py-1 rounded border border-slate-200">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sprint</p>
                    <p className="text-xs font-bold text-slate-700">{task.sprintName}</p>
                  </div>
                )}
                {task.link && (
                  <a 
                    href={task.link.startsWith('http') ? task.link : `https://${task.link}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white px-2 py-1 rounded border border-slate-200 hover:border-brand-500 hover:bg-brand-50 transition-all flex items-center gap-1.5 group/link"
                  >
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover/link:text-brand-600">Link</p>
                    <ExternalLink size={12} className="text-slate-400 group-hover/link:text-brand-600" />
                  </a>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Target size={14} className="text-slate-400" />
                  <span className="font-medium">{task.estimatedPoints} pts ({task.estimatedHours}h)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
                {task.targetDate && (
                  <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Target: {new Date(task.targetDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {task.classification === 'sprintly' && task.logs && task.logs.length > 0 && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity Logs</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {task.logs.slice().reverse().map((log, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] py-1 border-b border-slate-50 last:border-0">
                        <span className="text-slate-500 font-medium">{format(log.timestamp, 'MMM dd, HH:mm:ss')}</span>
                        <Badge variant={log.type === 'resume' ? 'success' : log.type === 'pause' ? 'warning' : 'info'}>
                          {log.type === 'transition' ? `${log.fromStatus} → ${log.toStatus}` : log.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-end gap-3">
              {isDone && (
                <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 space-y-3 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-brand-600" />
                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Completion Analytics</p>
                    <InfoDialog 
                      title="Completion Analytics" 
                      content={
                        <ul className="list-disc pl-4 space-y-2">
                          <li><strong>Total Efficiency:</strong> (Estimated Hours / Total Time Spent) × 100</li>
                          <li><strong>Dev Efficiency:</strong> (Estimated Hours / Active Dev Time) × 100</li>
                          <li><strong>Waiting Impact:</strong> Productivity lost due to external phases.</li>
                          <li><strong>Actual vs Estimate:</strong> Direct comparison of planning accuracy.</li>
                        </ul>
                      } 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-2 rounded-lg border border-brand-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Total Time</p>
                      <p className="text-sm font-black text-slate-900">{formatTimeDisplay(task.totalSeconds)}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-brand-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Efficiency</p>
                      <p className={cn("text-sm font-black", (task.totalSeconds / 3600) <= task.estimatedHours ? "text-green-600" : "text-red-600")}>
                        {totalEfficiency}%
                      </p>
                    </div>
                  </div>

                  {task.classification === 'sprintly' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Dev Efficiency</p>
                          <p className={cn("text-sm font-black", (devSec / 3600) <= task.estimatedHours ? "text-green-600" : "text-red-600")}>
                            {devEfficiency}%
                          </p>
                        </div>
                        <div className="bg-white/50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Waiting Impact</p>
                          <p className="text-sm font-black text-amber-600">-{waitingImpact.toFixed(0)}%</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Dev Time</p>
                          <p className="text-xs font-bold text-slate-700">{formatTimeDisplay(devSec)}</p>
                        </div>
                        <div className="bg-white/50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Waiting Time</p>
                          <p className="text-xs font-bold text-amber-600">{formatTimeDisplay(waitSec)}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                      <span>Actual vs Estimate</span>
                      <span>{(task.totalSeconds / 3600).toFixed(1)}h / {task.estimatedHours}h</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000", (task.totalSeconds / 3600) > task.estimatedHours ? "bg-red-500" : "bg-green-500")}
                        style={{ width: `${Math.min(100, (task.totalSeconds / 3600 / (task.estimatedHours || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {task.estimatedHours > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                    <span className="text-[10px] font-black text-slate-700">
                      {((task.totalSeconds / 3600 / task.estimatedHours) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                      className={cn("h-full transition-all duration-500", (task.totalSeconds / 3600) > task.estimatedHours ? "bg-red-500" : "bg-brand-500")}
                      style={{ width: `${Math.min(100, (task.totalSeconds / 3600 / task.estimatedHours) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
