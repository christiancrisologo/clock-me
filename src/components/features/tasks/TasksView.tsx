import React, { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import config from '../../../config.json';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, Sprint } from '../../../types';
import { computePerformanceMetrics } from '../../../utils/metrics';
import { PerformanceMetrics } from './PerformanceMetrics';
import { FilterToolbar } from './FilterToolbar';
import { TaskCard } from './TaskCard';
import { Button } from '../../ui/Button';
import { ConfirmModal } from '../../ui/ConfirmModal';

interface TasksViewProps {
  tasks: Task[];
  sprints: Sprint[];
  activeTaskIds: string[];
  isStatsMinimized: boolean;
  setIsStatsMinimized: (val: boolean) => void;
  onToggleTimer: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteTask: (id: string) => void;
  onDeleteTasks: (ids: string[]) => void;
  onEditTask: (task: Task) => void;
  onAddNewTask: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  sprints,
  activeTaskIds,
  isStatsMinimized,
  setIsStatsMinimized,
  onToggleTimer,
  onUpdateStatus,
  onDeleteTask,
  onDeleteTasks,
  onEditTask,
  onAddNewTask
}) => {
  const [statsFilter, setStatsFilter] = useState<'sprint' | 'date'>('sprint');
  const [selectedSprintId, setSelectedSprintId] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedTaskIds(new Set());
  }, [statsFilter, selectedSprintId, dateFrom, dateTo]);
  
  // Modal states
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Auto-unselect tasks if they start running
  useEffect(() => {
    const activeSelected = Array.from(selectedTaskIds).filter(id => activeTaskIds.includes(id));
    if (activeSelected.length > 0) {
      setSelectedTaskIds(prev => {
        const next = new Set(prev);
        activeSelected.forEach(id => next.delete(id));
        return next;
      });
    }
  }, [activeTaskIds, selectedTaskIds]);

  const toggleSelect = (taskId: string) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const selectAll = () => {
    const nonRunningTasks = tasks.filter(t => !activeTaskIds.includes(t.id));
    if (selectedTaskIds.size === nonRunningTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(nonRunningTasks.map(t => t.id)));
    }
  };

  const confirmBulkDelete = () => {
    onDeleteTasks(Array.from(selectedTaskIds));
    setSelectedTaskIds(new Set());
    setIsBulkDeleteModalOpen(false);
  };

  const confirmSingleDelete = () => {
    if (taskToDelete) {
      onDeleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const filteredTasks = tasks.filter(t => {
    if (statsFilter === 'sprint') {
      if (selectedSprintId === 'all') return true;
      const selectedSprint = sprints.find(s => s.id === selectedSprintId);
      return t.sprintId === selectedSprintId || t.sprintName === selectedSprint?.name;
    }
    if (statsFilter === 'date') {
      const taskDate = new Date(t.createdAt).toISOString().split('T')[0];
      return taskDate >= dateFrom && taskDate <= dateTo;
    }
    return true;
  });

  const metrics = computePerformanceMetrics(filteredTasks, ['Ready for QA', 'Code Review']);
  const completedTasks = filteredTasks.filter(t => t.status.toLowerCase() === 'done');

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aActive = activeTaskIds.includes(a.id);
    const bActive = activeTaskIds.includes(b.id);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;

    const aDone = a.status.toLowerCase() === 'done';
    const bDone = b.status.toLowerCase() === 'done';
    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;

    return b.createdAt - a.createdAt;
  });

  const pageSize = config.totalTaskPerPage || 10;
  const isPaginationEnabled = config.pagination !== false;
  const totalPages = Math.ceil(sortedTasks.length / pageSize);
  const paginatedTasks = isPaginationEnabled 
    ? sortedTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedTasks;

  return (
    <div className="space-y-6">
      <FilterToolbar
        statsFilter={statsFilter}
        setStatsFilter={setStatsFilter}
        selectedSprintId={selectedSprintId}
        setSelectedSprintId={setSelectedSprintId}
        sprints={sprints}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
      />

      <PerformanceMetrics
        isMinimized={isStatsMinimized}
        setIsMinimized={setIsStatsMinimized}
        totalTimeSpent={metrics.totalTimeSpentSeconds}
        completedTasksCount={completedTasks.length}
        totalTasksCount={filteredTasks.length}
        totalEstimatedHoursFromPoints={metrics.totalEstimatedHoursFromPoints}
        totalDevHours={metrics.totalDevHours}
        totalWaitingHours={metrics.totalWaitingHours}
        devEfficiency={metrics.devEfficiency}
        waitAdjustedEfficiency={metrics.waitAdjustedEfficiency}
      />

      {/* Bulk Actions Bar */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2 bg-white rounded-xl border transition-all duration-300",
        selectedTaskIds.size > 0 ? "opacity-100 translate-y-0 border-slate-200 shadow-sm" : "opacity-0 -translate-y-2 pointer-events-none border-transparent h-0 overflow-hidden p-0 m-0"
      )}>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedTaskIds.size === tasks.filter(t => !activeTaskIds.includes(t.id)).length && tasks.length > 0}
            onChange={selectAll}
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-700">
            {selectedTaskIds.size} Task(s) Selected
          </span>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsBulkDeleteModalOpen(true)}
          className="h-8 text-[10px] font-black uppercase tracking-wider gap-2"
        >
          <Trash2 size={14} />
          Delete Selected
        </Button>
      </div>

      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Plus size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No tasks found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-1">
              {statsFilter === 'sprint' ? 'No tasks in the selected sprint.' : statsFilter === 'date' ? `No tasks found from ${dateFrom} to ${dateTo}.` : 'No tasks recorded yet.'}
            </p>
            <Button
              variant="ghost"
              onClick={onAddNewTask}
              className="mt-6 text-brand-600 font-semibold hover:underline"
            >
              Create a new task
            </Button>
          </div>
        ) : (
          paginatedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isActive={activeTaskIds.includes(task.id)}
              isSelected={selectedTaskIds.has(task.id)}
              onToggleSelect={() => toggleSelect(task.id)}
              isExpanded={expandedTaskIds.has(task.id)}
              onToggleExpand={toggleExpand}
              onToggleTimer={onToggleTimer}
              onUpdateStatus={onUpdateStatus}
              onEdit={onEditTask}
              onDelete={(id) => setTaskToDelete(id)}
            />
          ))
        )}
      </div>

      {/* Pagination Bar */}
      {isPaginationEnabled && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 bg-white rounded-2xl border border-slate-100 shadow-sm border-b-4 border-b-brand-500">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Showing <span className="text-brand-600">{Math.min(paginatedTasks.length, pageSize)}</span> of <span className="text-slate-900">{sortedTasks.length}</span> tasks
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0 rounded-xl"
            >
              <ChevronLeft size={18} />
            </Button>
            
            <div className="flex items-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "h-9 w-9 rounded-xl text-[11px] font-black transition-all duration-300 mx-0.5",
                    currentPage === page 
                      ? "bg-brand-500 text-white shadow-lg shadow-brand-100 scale-110" 
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-9 w-9 p-0 rounded-xl"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal 
        isOpen={isBulkDeleteModalOpen}
        title="Delete Selected Tasks"
        message={`Are you sure you want to delete ${selectedTaskIds.size} selected tasks? This action cannot be undone.`}
        confirmLabel="Delete All"
        onConfirm={confirmBulkDelete}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
      />

      <ConfirmModal 
        isOpen={!!taskToDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? All logged time and data for this task will be permanently removed."
        confirmLabel="Delete Task"
        onConfirm={confirmSingleDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
