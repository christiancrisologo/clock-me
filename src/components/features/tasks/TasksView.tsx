import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Task, Sprint } from '../../../types';
import { PerformanceMetrics } from './PerformanceMetrics';
import { FilterToolbar } from './FilterToolbar';
import { TaskCard } from './TaskCard';
import { Button } from '../../ui/Button';

interface TasksViewProps {
  tasks: Task[];
  sprints: Sprint[];
  activeTaskIds: string[];
  isStatsMinimized: boolean;
  setIsStatsMinimized: (val: boolean) => void;
  onToggleTimer: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteTask: (id: string) => void;
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
  onEditTask,
  onAddNewTask
}) => {
  const [statsFilter, setStatsFilter] = useState<'sprint' | 'date'>('sprint');
  const [selectedSprintId, setSelectedSprintId] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

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

  const totalTimeSpent = filteredTasks.reduce((acc, t) => acc + t.totalSeconds, 0);
  const totalEstimated = filteredTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const completedTasks = filteredTasks.filter(t => t.status.toLowerCase() === 'done');
  
  const devTime = filteredTasks.reduce((acc, t) => {
    if (t.classification === 'sprintly') return acc + (t.phaseSeconds['In progress'] || 0);
    return acc + t.totalSeconds;
  }, 0);
  
  const efficiency = totalEstimated > 0 ? (completedTasks.reduce((acc, t) => acc + t.estimatedHours, 0) / (devTime / 3600 || 1)) : 0;

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
        totalTimeSpent={totalTimeSpent}
        completedTasksCount={completedTasks.length}
        totalTasksCount={filteredTasks.length}
        efficiency={efficiency}
      />

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
          sortedTasks.map(task => (
            <TaskCard 
              key={task.id}
              task={task}
              isActive={activeTaskIds.includes(task.id)}
              isExpanded={expandedTaskIds.has(task.id)}
              onToggleExpand={toggleExpand}
              onToggleTimer={onToggleTimer}
              onUpdateStatus={onUpdateStatus}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
};
