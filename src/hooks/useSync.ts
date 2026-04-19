import React, { useState, useEffect } from 'react';
import {
  fromSupabaseSprintRow,
  fromSupabaseTaskRow,
  isSupabaseConfigured,
  supabase,
  SupabaseSprintRow,
  SupabaseTaskRow,
  toSupabaseAnalyticsSnapshotRow,
  toSupabaseSprintRow,
  toSupabaseTaskRow
} from '../lib/supabase';
import { Task, Sprint } from '../types';
import { buildAnalyticsSnapshots } from '../utils/metrics';

export const useSync = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  sprints: Sprint[],
  setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>,
  autoSync: boolean
) => {
  const [isSupabaseOnline, setIsSupabaseOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const mergeByUpdatedAt = <T extends { id: string; updatedAt: number }>(
    localItems: T[],
    remoteItems: T[]
  ) => {
    const mergedItems = [...localItems];

    remoteItems.forEach((remoteItem) => {
      const localIndex = mergedItems.findIndex((localItem) => localItem.id === remoteItem.id);

      if (localIndex === -1) {
        mergedItems.push(remoteItem);
        return;
      }

      if (remoteItem.updatedAt > mergedItems[localIndex].updatedAt) {
        mergedItems[localIndex] = remoteItem;
      }
    });

    return mergedItems;
  };

  const persistAnalyticsSnapshots = async (nextTasks: Task[], nextSprints: Sprint[]) => {
    if (!supabase) return;

    const snapshotRows = buildAnalyticsSnapshots(nextTasks, nextSprints).map(toSupabaseAnalyticsSnapshotRow);

    if (snapshotRows.length === 0) return;

    const { error } = await supabase
      .from('cm_analytics_snapshots')
      .upsert(snapshotRows, { onConflict: 'snapshot_id' });

    if (error) {
      throw error;
    }
  };

  const upsertRows = async (nextTasks: Task[], nextSprints: Sprint[]) => {
    if (!supabase) return;

    const taskRows = nextTasks.map(toSupabaseTaskRow);
    const sprintRows = nextSprints.map(toSupabaseSprintRow);

    if (sprintRows.length > 0) {
      const { error } = await supabase.from('cm_sprints').upsert(sprintRows, { onConflict: 'id' });
      if (error) throw error;
    }

    if (taskRows.length > 0) {
      const { error } = await supabase.from('cm_tasks').upsert(taskRows, { onConflict: 'id' });
      if (error) throw error;
    }
  };

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      if (!isSupabaseConfigured) {
        setIsSupabaseOnline(false);
        return;
      }
      try {
        if (!supabase) {
          setIsSupabaseOnline(false);
          return;
        }
        const { error } = await supabase.from('cm_tasks').select('id').limit(1);
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
    if (!isSupabaseConfigured || !navigator.onLine || !supabase) {
      setIsSupabaseOnline(false);
      return;
    }

    setIsSyncing(true);

    try {
      const [
        { data: remoteTaskRows, error: tasksError },
        { data: remoteSprintRows, error: sprintsError }
      ] = await Promise.all([
        supabase.from('cm_tasks').select('*'),
        supabase.from('cm_sprints').select('*')
      ]);

      if (tasksError || sprintsError) {
        console.warn('Sync failed - status check:', tasksError || sprintsError);
        setIsSupabaseOnline(false);
        return;
      }

      setIsSupabaseOnline(true);

      const remoteTasks = (remoteTaskRows || []).map((row) => fromSupabaseTaskRow(row as SupabaseTaskRow));
      const remoteSprints = (remoteSprintRows || []).map((row) => fromSupabaseSprintRow(row as SupabaseSprintRow));

      if (forcePush) {
        const localTaskIds = new Set(tasks.map((task) => task.id));
        const localSprintIds = new Set(sprints.map((sprint) => sprint.id));
        const remoteOnlyTaskIds = remoteTasks
          .map((task) => task.id)
          .filter((taskId) => !localTaskIds.has(taskId));
        const remoteOnlySprintIds = remoteSprints
          .map((sprint) => sprint.id)
          .filter((sprintId) => !localSprintIds.has(sprintId));

        if (remoteOnlyTaskIds.length > 0) {
          const { error } = await supabase.from('cm_tasks').delete().in('id', remoteOnlyTaskIds);
          if (error) throw error;
        }

        if (remoteOnlySprintIds.length > 0) {
          const { error } = await supabase.from('cm_sprints').delete().in('id', remoteOnlySprintIds);
          if (error) throw error;
        }

        await upsertRows(tasks, sprints);
        await persistAnalyticsSnapshots(tasks, sprints);
      } else {
        const mergedTasks = mergeByUpdatedAt(tasks, remoteTasks);
        const mergedSprints = mergeByUpdatedAt(sprints, remoteSprints);

        setTasks(mergedTasks);
        setSprints(mergedSprints);

        await upsertRows(mergedTasks, mergedSprints);
        await persistAnalyticsSnapshots(mergedTasks, mergedSprints);
      }

      setLastSyncTime(Date.now());
    } catch (error) {
      console.error('Sync error:', error);
      setIsSupabaseOnline(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const pushTaskToSupabase = async (task: Task) => {
    if (isSupabaseConfigured && navigator.onLine && autoSync && supabase) {
      try {
        const { error } = await supabase
          .from('cm_tasks')
          .upsert(toSupabaseTaskRow(task), { onConflict: 'id' });

        if (error) {
          setIsSupabaseOnline(false);
          return;
        }

        setIsSupabaseOnline(true);
      } catch (error) {
        setIsSupabaseOnline(false);
      }
    }
  };

  const deleteTaskFromSupabase = async (taskId: string) => {
    if (isSupabaseConfigured && navigator.onLine && autoSync && supabase) {
      try {
        const { error } = await supabase.from('cm_tasks').delete().eq('id', taskId);

        if (error) {
          setIsSupabaseOnline(false);
          return;
        }

        setIsSupabaseOnline(true);
      } catch (error) {
        setIsSupabaseOnline(false);
      }
    }
  };

  useEffect(() => {
    if (autoSync) {
      void syncWithSupabase();
    }
  }, []);

  return {
    isSupabaseOnline,
    isSyncing,
    lastSyncTime,
    syncWithSupabase,
    pushTaskToSupabase,
    deleteTaskFromSupabase
  };
};
