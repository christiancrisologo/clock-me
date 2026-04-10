import { useState, useEffect } from 'react';
import { Task, TaskLog } from '../types';
import { TASK_STATUSES, HOURS_PER_POINT } from '../constants';

export const useTasks = (
  syncHandlers: {
    pushTaskToSupabase: (task: Task) => Promise<void>;
    deleteTaskFromSupabase: (taskId: string) => Promise<void>;
    syncWithSupabase: () => Promise<void>;
  },
  autoSync: boolean
) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('clock-me-tasks');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.map((t: any) => ({
      ...t,
      updatedAt: t.updatedAt || t.createdAt || Date.now()
    }));
  });

  const [activeTaskIds, setActiveTaskIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('clock-me-active-task-ids');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('clock-me-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('clock-me-active-task-ids', JSON.stringify(activeTaskIds));
  }, [activeTaskIds]);

  const addTask = (taskData: Partial<Task>) => {
    const pts = taskData.estimatedPoints || 0;
    const hrs = pts * HOURS_PER_POINT;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskData.title || 'Untitled Task',
      jiraId: taskData.jiraId || '',
      status: TASK_STATUSES[0],
      type: taskData.type || 'Development',
      classification: taskData.classification || 'regular',
      phaseSeconds: {},
      logs: [],
      estimatedPoints: pts,
      estimatedHours: hrs,
      totalSeconds: 0,
      sessions: [],
      sprintId: taskData.sprintId || '',
      sprintName: taskData.sprintName || '',
      createdAt: taskData.createdAt || Date.now(),
      updatedAt: Date.now(),
      targetDate: taskData.targetDate
    };

    setTasks(prev => [newTask, ...prev]);
    syncHandlers.pushTaskToSupabase(newTask);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedTask = {
          ...t,
          ...updates,
          updatedAt: Date.now()
        };
        if (updates.estimatedPoints !== undefined) {
          updatedTask.estimatedHours = updates.estimatedPoints * HOURS_PER_POINT;
        }
        syncHandlers.pushTaskToSupabase(updatedTask);
        return updatedTask;
      }
      return t;
    }));
  };

  const toggleTimer = async (taskId: string) => {
    const isActive = activeTaskIds.includes(taskId);
    if (isActive) {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const updatedTask = {
            ...t,
            updatedAt: Date.now(),
            logs: [...(t.logs || []), {
              timestamp: Date.now(),
              fromStatus: t.status,
              toStatus: t.status,
              type: 'pause' as const
            }]
          };
          syncHandlers.pushTaskToSupabase(updatedTask);
          return updatedTask;
        }
        return t;
      }));
      setActiveTaskIds(prev => prev.filter(id => id !== taskId));
    } else {
      if (autoSync) await syncHandlers.syncWithSupabase();
      
      setActiveTaskIds(prev => [...prev, taskId]);
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          let nextStatus = t.status;
          const inProgressStatus = TASK_STATUSES.find(s => s.toLowerCase().includes('progress')) || TASK_STATUSES[1];
          
          if (t.classification === 'sprintly' && (t.status === 'Code Review' || t.status === 'Testing')) {
            nextStatus = inProgressStatus;
          } else if (t.status === TASK_STATUSES[0]) {
            nextStatus = inProgressStatus;
          }

          const newLog: TaskLog = {
            timestamp: Date.now(),
            fromStatus: t.status,
            toStatus: nextStatus,
            type: t.status === nextStatus ? 'resume' : 'transition'
          };

          const updatedTask = { 
            ...t, 
            status: nextStatus,
            updatedAt: Date.now(),
            logs: [...(t.logs || []), newLog]
          };
          syncHandlers.pushTaskToSupabase(updatedTask);
          return updatedTask;
        }
        return t;
      }));
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: string) => {
    if (activeTaskIds.includes(taskId)) return;
    
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newLog: TaskLog = {
          timestamp: Date.now(),
          fromStatus: t.status,
          toStatus: newStatus,
          type: 'transition'
        };
        const updatedTask = { 
          ...t, 
          status: newStatus,
          updatedAt: Date.now(),
          logs: [...(t.logs || []), newLog]
        };
        syncHandlers.pushTaskToSupabase(updatedTask);
        return updatedTask;
      }
      return t;
    }));
  };

  const deleteTask = (taskId: string) => {
    setActiveTaskIds(prev => prev.filter(id => id !== taskId));
    setTasks(prev => prev.filter(t => t.id !== taskId));
    syncHandlers.deleteTaskFromSupabase(taskId);
  };

  return {
    tasks,
    setTasks,
    activeTaskIds,
    addTask,
    updateTask,
    toggleTimer,
    updateTaskStatus,
    deleteTask
  };
};
