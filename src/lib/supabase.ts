import { createClient } from '@supabase/supabase-js';
import { Sprint, Task } from '../types';
import { AnalyticsSnapshot } from '../utils/metrics';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

export const supabase = (() => {
  if (!isSupabaseConfigured) return null;
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Supabase initialization failed:', error);
    return null;
  }
})();

type JsonObject = Record<string, unknown>;

export interface SupabaseTaskRow {
  id: string;
  title: string;
  jira_id: string | null;
  status: string;
  type: string;
  classification: 'regular' | 'sprintly';
  phase_seconds: JsonObject;
  logs: unknown[];
  estimated_points: number;
  estimated_hours: number;
  total_seconds: number;
  sessions: unknown[];
  sprint_id: string | null;
  sprint_name: string | null;
  created_at: number;
  updated_at: number;
  target_date: string | null;
  link: string | null;
  issue_key: string | null;
  issue_id: string | null;
  assignee: string | null;
  assignee_id: string | null;
  resolution: string | null;
  resolved: string | null;
  codebase: string | null;
  story_points: number | null;
  active_started_at: string | null;
  active_status: string | null;
  user_id: string | null;
}

export interface SupabaseSprintRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  capacity_hours: number;
  is_current: boolean;
  updated_at: number;
  user_id: string | null;
}

export interface SupabaseAnalyticsSnapshotRow {
  snapshot_id: string;
  snapshot_type: 'global' | 'sprint' | 'productivity';
  sprint_id: string | null;
  period: 'day' | 'week' | 'month' | null;
  task_count: number;
  completed_task_count: number;
  payload: JsonObject;
  updated_at: number;
  user_id: string | null;
}

const asObject = (value: unknown): JsonObject => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
};

const asArray = <T>(value: unknown): T[] => Array.isArray(value) ? (value as T[]) : [];

export const toSupabaseTaskRow = (task: Task, userId?: string | null): SupabaseTaskRow => ({
  id: task.id,
  title: task.title,
  jira_id: task.jiraId || null,
  status: task.status,
  type: task.type,
  classification: task.classification,
  phase_seconds: task.phaseSeconds || {},
  logs: task.logs || [],
  estimated_points: task.estimatedPoints,
  estimated_hours: task.estimatedHours,
  total_seconds: task.totalSeconds,
  sessions: task.sessions || [],
  sprint_id: task.sprintId || null,
  sprint_name: task.sprintName || null,
  created_at: task.createdAt,
  updated_at: task.updatedAt,
  target_date: task.targetDate || null,
  link: task.link || null,
  issue_key: task.issueKey || null,
  issue_id: task.issueId || null,
  assignee: task.assignee || null,
  assignee_id: task.assigneeId || null,
  resolution: task.resolution || null,
  resolved: task.resolved || null,
  codebase: task.codebase || null,
  story_points: task.storyPoints ?? null,
  active_started_at: task.activeStartedAt || null,
  active_status: task.activeStatus || null,
  user_id: userId || null
});

export const fromSupabaseTaskRow = (row: SupabaseTaskRow): Task => ({
  id: row.id,
  title: row.title,
  jiraId: row.jira_id || '',
  status: row.status,
  type: row.type,
  classification: row.classification,
  phaseSeconds: asObject(row.phase_seconds) as Record<string, number>,
  logs: asArray(row.logs) as Task['logs'],
  estimatedPoints: Number(row.estimated_points || 0),
  estimatedHours: Number(row.estimated_hours || 0),
  totalSeconds: Number(row.total_seconds || 0),
  sessions: asArray(row.sessions) as Task['sessions'],
  sprintId: row.sprint_id || '',
  sprintName: row.sprint_name || '',
  createdAt: Number(row.created_at || Date.now()),
  updatedAt: Number(row.updated_at || row.created_at || Date.now()),
  targetDate: row.target_date || undefined,
  link: row.link || undefined,
  issueKey: row.issue_key || undefined,
  issueId: row.issue_id || undefined,
  assignee: row.assignee || undefined,
  assigneeId: row.assignee_id || undefined,
  resolution: row.resolution || undefined,
  resolved: row.resolved || undefined,
  codebase: row.codebase || undefined,
  storyPoints: row.story_points ?? undefined,
  activeStartedAt: row.active_started_at || undefined,
  activeStatus: row.active_status || undefined,
  userId: row.user_id || undefined
});

export const toSupabaseSprintRow = (sprint: Sprint, userId?: string | null): SupabaseSprintRow => ({
  id: sprint.id,
  name: sprint.name,
  start_date: sprint.startDate,
  end_date: sprint.endDate,
  capacity_hours: sprint.capacityHours,
  is_current: sprint.isCurrent,
  updated_at: sprint.updatedAt,
  user_id: userId || null
});

export const fromSupabaseSprintRow = (row: SupabaseSprintRow): Sprint => ({
  id: row.id,
  name: row.name,
  startDate: row.start_date,
  endDate: row.end_date,
  capacityHours: Number(row.capacity_hours || 0),
  isCurrent: row.is_current,
  updatedAt: Number(row.updated_at || Date.now()),
  userId: row.user_id || undefined
});

export const toSupabaseAnalyticsSnapshotRow = (
  snapshot: AnalyticsSnapshot,
  userId?: string | null
): SupabaseAnalyticsSnapshotRow => ({
  snapshot_id: snapshot.snapshotId,
  snapshot_type: snapshot.snapshotType,
  sprint_id: snapshot.sprintId,
  period: snapshot.period,
  task_count: snapshot.taskCount,
  completed_task_count: snapshot.completedTaskCount,
  payload: snapshot.payload,
  updated_at: snapshot.updatedAt,
  user_id: userId || null
});
