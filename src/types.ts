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
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  capacityHours: number;
  isCurrent: boolean;
  updatedAt: number;
}

export interface AppState {
  tasks: Task[];
  sprints: Sprint[];
  activeTaskIds: string[];
}
