import React from 'react';
import { X } from 'lucide-react';
import { Task, Sprint } from '../../../types';
import { TASK_TYPES, TASK_STATUSES } from '../../../constants';
import { Button } from '../../ui/Button';

interface TaskFormProps {
  task?: Task | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  addingTaskType: 'regular' | 'sprintly';
  sprints: Sprint[];
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onClose,
  onSubmit,
  addingTaskType,
  sprints
}) => {
  const isEditing = !!task;
  const classification = isEditing ? task.classification : addingTaskType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {isEditing ? 'Edit Task' : `New ${classification === 'sprintly' ? 'Sprintly' : 'Regular'} Task`}
            </h3>
            <p className="text-sm text-slate-500">Enter task details to begin tracking</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X size={24} />
          </Button>
        </div>
        
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                <input 
                  autoFocus
                  required
                  name="title"
                  defaultValue={task?.title}
                  placeholder="e.g. Implement User Authentication"
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">JIRA ID (Optional)</label>
                <input 
                  name="jiraId"
                  defaultValue={task?.jiraId}
                  placeholder="DEV-123"
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Type</label>
                <select 
                  name="type"
                  defaultValue={task?.type || (classification === 'sprintly' ? 'Development' : TASK_TYPES[0])}
                  disabled={classification === 'sprintly' && !isEditing}
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all appearance-none cursor-pointer"
                >
                  {TASK_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estimate (Points)</label>
                <input 
                  required
                  type="number"
                  step="0.5"
                  name="estimatedPoints"
                  defaultValue={task?.estimatedPoints}
                  placeholder="3"
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sprint</label>
                <input 
                  name="sprintName"
                  list="sprint-suggestions"
                  defaultValue={task?.sprintName || sprints.find(s => s.isCurrent)?.name}
                  placeholder="e.g. Sprint 24"
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all appearance-none cursor-pointer"
                />
                <datalist id="sprint-suggestions">
                  {sprints.map(s => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <select 
                  name="status"
                  defaultValue={task?.status || 'To do'}
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all appearance-none cursor-pointer"
                >
                  {TASK_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                <select 
                  name="classification"
                  defaultValue={classification}
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all appearance-none cursor-pointer"
                >
                  <option value="regular">Regular</option>
                  <option value="sprintly">Sprintly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date (Optional)</label>
                <input 
                  type="date"
                  name="targetDate"
                  defaultValue={task?.targetDate}
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Created At (Optional)</label>
                <input 
                  type="date"
                  name="createdAt"
                  defaultValue={task ? new Date(task.createdAt).toISOString().split('T')[0] : ''}
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all"
                />
              </div>
            </div>

            {isEditing && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Seconds (Manual Adjust)</label>
                <input 
                  type="number"
                  name="totalSeconds"
                  defaultValue={task.totalSeconds}
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference Link (Optional)</label>
              <input 
                name="link"
                defaultValue={task?.link}
                placeholder="https://github.com/v1/..."
                className="w-full text-sm font-bold border border-slate-200 rounded-xl px-4 py-3 bg-white outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 py-4 text-xs uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 py-4 text-xs uppercase tracking-widest shadow-lg shadow-brand-100"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
