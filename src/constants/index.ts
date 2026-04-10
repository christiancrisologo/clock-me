import config from '../config.json';
import { Sprint } from '../types';

export const APP_NAME = 'TITO TimeInTimeOut';
export const APP_VERSION = '1.0.0';
export const LS_NAME_TASK = "tito-ls-task";
export const LS_NAME_SPRINT = "tito-ls-sprint";
export const LS_NAME_SETTINGS = "tito-ls-settings";

export const HOURS_PER_POINT = config.hoursPerPoint;
export const TASK_TYPES = config.taskTypes;
export const TASK_STATUSES = config.taskStatuses;
export const AUTO_SYNC_DEFAULT = config.autoSync;

export const INITIAL_SPRINT: Sprint = {
  id: 'sprint-1',
  name: 'Sprint 24.1',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  capacityHours: 40,
  isCurrent: true,
  updatedAt: Date.now()
};

export const VIEWS = {
  TASKS: 'tasks',
  DASHBOARD: 'dashboard',
  PRODUCTIVITY: 'productivity',
  SETTINGS: 'settings'
} as const;

export type AppView = typeof VIEWS[keyof typeof VIEWS];
