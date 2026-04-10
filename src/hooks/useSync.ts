import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Task, Sprint } from '../types';
import { AUTO_SYNC_DEFAULT } from '../constants';

export const useSync = (
  tasks: Task[], 
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  sprints: Sprint[],
  setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>
) => {
  const [isSupabaseOnline, setIsSupabaseOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(AUTO_SYNC_DEFAULT);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      if (!isSupabaseConfigured) {
        setIsSupabaseOnline(false);
        return;
      }
      try {
        const { error } = await supabase.from('tasks').select('id').limit(1);
        setIsSupabaseOnline(!error);
      } catch (e) {
        setIsSupabaseOnline(false);
      }
    };

    checkSupabaseConnection();
    const interval = setInterval(checkSupabaseConnection, 30000);
    
    const handleOnline = () => checkSupabaseConnection();
    const handleOffline = () => setIsSupabaseOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncWithSupabase = async (forcePush = false) => {
    if (!isSupabaseConfigured || !navigator.onLine) return;
    setIsSyncing(true);
    try {
      const { data: remoteTasks, error: tasksError } = await supabase.from('tasks').select('*');
      const { data: remoteSprints, error: sprintsError } = await supabase.from('sprints').select('*');

      if (tasksError || sprintsError) {
        setIsSupabaseOnline(false);
        throw tasksError || sprintsError;
      }

      setIsSupabaseOnline(true);

      if (forcePush) {
        for (const task of tasks) await supabase.from('tasks').upsert(task);
        for (const sprint of sprints) await supabase.from('sprints').upsert(sprint);
      } else {
        const mergedTasks = [...tasks];
        remoteTasks?.forEach((rt: Task) => {
          const localIndex = mergedTasks.findIndex(lt => lt.id === rt.id);
          if (localIndex === -1) mergedTasks.push(rt);
          else if (rt.updatedAt > mergedTasks[localIndex].updatedAt) mergedTasks[localIndex] = rt;
        });

        const mergedSprints = [...sprints];
        remoteSprints?.forEach((rs: Sprint) => {
          const localIndex = mergedSprints.findIndex(ls => ls.id === rs.id);
          if (localIndex === -1) mergedSprints.push(rs);
          else if (rs.updatedAt > mergedSprints[localIndex].updatedAt) mergedSprints[localIndex] = rs;
        });

        setTasks(mergedTasks);
        setSprints(mergedSprints);

        for (const task of mergedTasks) await supabase.from('tasks').upsert(task);
        for (const sprint of mergedSprints) await supabase.from('sprints').upsert(sprint);
      }
      setLastSyncTime(Date.now());
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const pushTaskToSupabase = async (task: Task) => {
    if (isSupabaseConfigured && navigator.onLine && autoSync) {
      try {
        const { error } = await supabase.from('tasks').upsert(task);
        setIsSupabaseOnline(!error);
      } catch (error) {
        setIsSupabaseOnline(false);
      }
    }
  };

  const deleteTaskFromSupabase = async (taskId: string) => {
    if (isSupabaseConfigured && navigator.onLine && autoSync) {
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        setIsSupabaseOnline(!error);
      } catch (error) {
        setIsSupabaseOnline(false);
      }
    }
  };

  useEffect(() => {
    if (autoSync) syncWithSupabase();
  }, []);

  return {
    isSupabaseOnline,
    isSyncing,
    autoSync,
    setAutoSync,
    lastSyncTime,
    syncWithSupabase,
    pushTaskToSupabase,
    deleteTaskFromSupabase
  };
};
