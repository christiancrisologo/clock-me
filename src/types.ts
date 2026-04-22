export type TaskStatus = string;

export interface TimeSession {
  start: number;
  end?: number;
}

export interface TaskLog {
  timestamp: number;
  fromStatus: string;
  toStatus: string;
  type: 'transition' | 'pause' | 'resume';
}

export interface Task {
  id: string;
  title: string;
  jiraId?: string;
  status: TaskStatus;
  type: string;
  classification: 'regular' | 'sprintly';
  phaseSeconds: Record<string, number>;
  logs: TaskLog[];
  estimatedPoints: number;
  estimatedHours: number;
  totalSeconds: number;
  sessions: TimeSession[];
  sprintId: string;
  sprintName?: string;
  createdAt: number;
  updatedAt: number;
  targetDate?: string;
  link?: string;
  issueKey?: string;
  issueId?: string;
  assignee?: string;
  assigneeId?: string;
  resolution?: string;
  resolved?: string;
  codebase?: string;
  storyPoints?: number;
  activeStartedAt?: string;
  activeStatus?: string;
  userId?: string; // User relationship
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  capacityHours: number;
  isCurrent: boolean;
  updatedAt: number;
  userId?: string; // User relationship
}

export interface AppState {
  tasks: Task[];
  sprints: Sprint[];
  activeTaskIds: string[];
}

export interface AuthUser {
  id: string;
  username: string;
  isGuest: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  isAuthenticated: boolean;
  isGuest: boolean;
  token?: string;
  expiresAt?: string;
}
