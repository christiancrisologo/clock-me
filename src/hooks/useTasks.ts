import { useState, useEffect } from 'react';
import { Task, TaskLog } from '../types';
import { LS_NAME_TASK, TASK_STATUSES, HOURS_PER_POINT } from '../constants';

export const useTasks = (
  syncHandlers: {
    pushTaskToSupabase?: (task: Task) => Promise<void>;
    deleteTaskFromSupabase?: (taskId: string) => Promise<void>;
    syncWithSupabase?: (forcePush?: boolean) => Promise<void>;
  } | null | undefined,
  autoSync: boolean,
  userId: string
) => {
  const taskStorageKey = `${LS_NAME_TASK}:${userId}`;
  const activeTaskStorageKey = `clock-me-active-task-ids:${userId}`;

  const [tasks, setTasks] = useState<Task[]>(() => {
    // Migration: Check for both new and old keys
    const savedNew = localStorage.getItem(taskStorageKey);
    if (savedNew) {
      const parsed = JSON.parse(savedNew);
      return parsed.map((t: any) => ({
        ...t,
        updatedAt: t.updatedAt || t.createdAt || Date.now(),
        userId: t.userId || userId
      }));
    }

    const savedOld = localStorage.getItem('clock-me-tasks') || localStorage.getItem('TITO-tasks');
    if (savedOld) {
      console.log('Migrating tasks to new localStorage key...');
      const parsed = JSON.parse(savedOld);
      return parsed.map((t: any) => ({
        ...t,
        updatedAt: t.updatedAt || t.createdAt || Date.now()
      }));
    }

    return [];
  });

  const [activeTaskIds, setActiveTaskIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(activeTaskStorageKey);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
  }, [taskStorageKey, tasks]);

  useEffect(() => {
    localStorage.setItem(activeTaskStorageKey, JSON.stringify(activeTaskIds));
  }, [activeTaskIds, activeTaskStorageKey]);

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
      targetDate: taskData.targetDate,
      userId
    };

    setTasks(prev => [newTask, ...prev]);
    syncHandlers?.pushTaskToSupabase?.(newTask);
  };

  const addTasks = async (taskDatas: Partial<Task>[], onProgress?: (current: number) => void) => {
    // 1. Filter out duplicates from the incoming data and existing state
    const duplicateCount = { val: 0 };
    const filteredTaskDatas = taskDatas.filter(newData => {
      // Check if task with same jiraId (if exists) or same title already exists in current state
      const isDuplicate = tasks.some(existing => {
        if (newData.jiraId && existing.jiraId) {
          return newData.jiraId === existing.jiraId;
        }
        return newData.title === existing.title;
      });
      
      if (isDuplicate) duplicateCount.val++;
      return !isDuplicate;
    });

    if (filteredTaskDatas.length === 0) {
      return { addedCount: 0, duplicateCount: duplicateCount.val };
    }

    const newTasks: Task[] = filteredTaskDatas.map(taskData => {
      const pts = taskData.estimatedPoints || 0;
      const hrs = pts * HOURS_PER_POINT;
      
      return {
        id: taskData.id || crypto.randomUUID(), // Always generate a new UUID for imported tasks as requested
        title: taskData.title || 'Untitled Task',
        jiraId: taskData.jiraId || '',
        status: taskData.status || TASK_STATUSES[0],
        type: taskData.type || 'Development',
        classification: taskData.classification || 'regular',
        phaseSeconds: taskData.phaseSeconds || {},
        logs: taskData.logs || [],
        estimatedPoints: pts,
        estimatedHours: hrs,
        totalSeconds: taskData.totalSeconds || 0,
        sessions: taskData.sessions || [],
        sprintId: taskData.sprintId || '',
        sprintName: taskData.sprintName || '',
        createdAt: taskData.createdAt || Date.now(),
        updatedAt: Date.now(),
        targetDate: taskData.targetDate,
        link: taskData.link,
        userId
      };
    });

    setTasks(prev => [...newTasks, ...prev]);
    
    // Push each new task to Supabase
    for (let i = 0; i < newTasks.length; i++) {
      const task = newTasks[i];
      await syncHandlers?.pushTaskToSupabase?.(task);
      onProgress?.(i + 1);
    }

    return { addedCount: newTasks.length, duplicateCount: duplicateCount.val };
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
        syncHandlers?.pushTaskToSupabase?.(updatedTask);
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
          syncHandlers?.pushTaskToSupabase?.(updatedTask);
          return updatedTask;
        }
        return t;
      }));
      setActiveTaskIds(prev => prev.filter(id => id !== taskId));
    } else {
      if (autoSync) await syncHandlers?.syncWithSupabase?.();
      
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
          syncHandlers?.pushTaskToSupabase?.(updatedTask);
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
        syncHandlers?.pushTaskToSupabase?.(updatedTask);
        return updatedTask;
      }
      return t;
    }));
  };

  const deleteTask = (taskId: string) => {
    setActiveTaskIds(prev => prev.filter(id => id !== taskId));
    setTasks(prev => prev.filter(t => t.id !== taskId));
    syncHandlers?.deleteTaskFromSupabase?.(taskId);
  };

  const deleteTasks = (taskIds: string[]) => {
    setActiveTaskIds(prev => prev.filter(id => !taskIds.includes(id)));
    setTasks(prev => prev.filter(t => !taskIds.includes(t.id)));
    taskIds.forEach(id => syncHandlers?.deleteTaskFromSupabase?.(id));
  };

  return {
    tasks,
    setTasks,
    activeTaskIds,
    addTask,
    addTasks,
    updateTask,
    toggleTimer,
    updateTaskStatus,
    deleteTask,
    deleteTasks
  };
};
