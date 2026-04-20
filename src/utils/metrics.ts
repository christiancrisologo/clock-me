import { format } from 'date-fns';
import { Sprint, Task } from '../types';
import { HOURS_PER_POINT } from '../constants';

export type ProductivityPeriod = 'day' | 'week' | 'month';

export interface AnalyticsSnapshot {
  snapshotId: string;
  snapshotType: 'global' | 'sprint' | 'productivity';
  sprintId: string | null;
  period: ProductivityPeriod | null;
  taskCount: number;
  completedTaskCount: number;
  payload: Record<string, unknown>;
  updatedAt: number;
}

export const filterTasksBySprint = (
  tasks: Task[],
  sprints: Sprint[],
  sprintId?: string
): Task[] => {
  if (!sprintId || sprintId === 'all') return tasks;

  const selectedSprint = sprints.find((sprint) => sprint.id === sprintId);
  const selectedName = selectedSprint?.name;

  return tasks.filter((task) => {
    if (task.sprintId === sprintId) return true;

    if (selectedName && task.sprintName === selectedName) return true;

    // Fallback for tasks/sprints created from CSV where sprint id can be absent
    if (!selectedName && task.sprintName === sprintId) return true;

    return false;
  });
};

export const taskEstimatedHoursFromPoints = (task: Task): number => {
  const computed = (task.estimatedPoints || 0) * HOURS_PER_POINT;
  return computed > 0 ? computed : (task.estimatedHours || 0);
};

export const taskDevSeconds = (task: Task): number => {
  if (task.classification === 'sprintly') {
    return (task.phaseSeconds['In progress'] || 0) ||  task.totalSeconds;
  }

  return task.totalSeconds;
};

export const DEFAULT_WAITING_PHASES = ['Ready for QA', 'Code Review'] as const;

export const taskWaitingSeconds = (
  task: Task,
  waitingPhases: readonly string[] = DEFAULT_WAITING_PHASES
): number => {
  if (task.classification !== 'sprintly') return 0;

  return waitingPhases.reduce((acc, phase) => acc + (task.phaseSeconds[phase] || 0), 0);
};

export interface PerformanceMetricsSummary {
  totalTasksCount: number;
  completedTasksCount: number;
  totalEstimatedPoints: number;
  totalEstimatedHoursFromPoints: number;
  totalTimeSpentSeconds: number;
  totalDevSeconds: number;
  totalDevHours: number;
  totalWaitingSeconds: number;
  totalWaitingHours: number;
  devEfficiency: number;
  waitAdjustedEfficiency: number;
  completedEstimatedPoints: number;
  completedEstimatedHoursFromPoints: number;
  completedDevSeconds: number;
  completedDevHours: number;
  completedDevEfficiency: number;
}

export const computePerformanceMetrics = (
  tasks: Task[],
  waitingPhases: readonly string[] = DEFAULT_WAITING_PHASES
): PerformanceMetricsSummary => {
  const completedTasks = tasks.filter((task) => task.status.toLowerCase() === 'done');

  const totalEstimatedPoints = tasks.reduce((acc, task) => acc + (task.estimatedPoints || 0), 0);
  const totalEstimatedHoursFromPoints = tasks.reduce((acc, task) => acc + taskEstimatedHoursFromPoints(task), 0);
  const totalTimeSpentSeconds = tasks.reduce((acc, task) => acc + task.totalSeconds, 0);
  const totalDevSeconds = tasks.reduce((acc, task) => acc + taskDevSeconds(task), 0);
  const totalWaitingSeconds = tasks.reduce((acc, task) => acc + taskWaitingSeconds(task, waitingPhases), 0);

  const completedEstimatedPoints = completedTasks.reduce((acc, task) => acc + (task.estimatedPoints || 0), 0);
  const completedEstimatedHoursFromPoints = completedTasks.reduce((acc, task) => acc + taskEstimatedHoursFromPoints(task), 0);
  const completedDevSeconds = completedTasks.reduce((acc, task) => acc + taskDevSeconds(task), 0);

  const totalDevHours = totalDevSeconds / 3600;
  const totalWaitingHours = totalWaitingSeconds / 3600;
  const completedDevHours = completedDevSeconds / 3600;

  const devEfficiency = totalEstimatedHoursFromPoints > 0
    ? (totalEstimatedHoursFromPoints / (totalDevHours || 1))
    : 0;

  const waitAdjustedEfficiency = totalEstimatedHoursFromPoints > 0
    ? (totalEstimatedHoursFromPoints / ((totalDevHours + totalWaitingHours) || 1))
    : 0;

  const completedDevEfficiency = completedEstimatedHoursFromPoints > 0
    ? (completedEstimatedHoursFromPoints / (completedDevHours || 1))
    : 0;

  return {
    totalTasksCount: tasks.length,
    completedTasksCount: completedTasks.length,
    totalEstimatedPoints,
    totalEstimatedHoursFromPoints,
    totalTimeSpentSeconds,
    totalDevSeconds,
    totalDevHours,
    totalWaitingSeconds,
    totalWaitingHours,
    devEfficiency,
    waitAdjustedEfficiency,
    completedEstimatedPoints,
    completedEstimatedHoursFromPoints,
    completedDevSeconds,
    completedDevHours,
    completedDevEfficiency
  };
};

export const calculateEfficiency = (tasks: Task[]) => {
  const totalEstimatedHours = tasks.reduce((acc, task) => acc + taskEstimatedHoursFromPoints(task), 0);
  const totalDevSeconds = tasks.reduce((acc, task) => acc + taskDevSeconds(task), 0);

  return totalEstimatedHours > 0 ? (totalEstimatedHours / (totalDevSeconds / 3600 || 1)) : 0;
};

export const buildSprintChartData = (tasks: Task[]) => tasks.map((task) => {
  const dev = taskDevSeconds(task);
  const wait = taskWaitingSeconds(task, DEFAULT_WAITING_PHASES);

  return {
    name: task.jiraId || task.title.substring(0, 8),
    dev: Number((dev / 3600).toFixed(2)),
    wait: Number((wait / 3600).toFixed(2)),
    estimated: Number(taskEstimatedHoursFromPoints(task).toFixed(2))
  };
});

export const buildProductivityChartData = (tasks: Task[], period: ProductivityPeriod) => {
  const grouped: Record<string, { name: string; devHours: number; waitHours: number; points: number }> = {};

  tasks.forEach((task) => {
    const date = new Date(task.createdAt);
    let key = '';

    if (period === 'day') key = format(date, 'MMM dd');
    else if (period === 'week') key = `Week ${format(date, 'w')}`;
    else key = format(date, 'MMM yyyy');

    if (!grouped[key]) {
      grouped[key] = { name: key, devHours: 0, waitHours: 0, points: 0 };
    }

    const dev = taskDevSeconds(task);
    const wait = taskWaitingSeconds(task, DEFAULT_WAITING_PHASES);

    grouped[key].devHours += dev / 3600;
    grouped[key].waitHours += wait / 3600;

    if (task.status.toLowerCase() === 'done') {
      grouped[key].points += task.estimatedPoints;
    }
  });

  return Object.values(grouped);
};

export const calculateTopPerformingTasks = (tasks: Task[]) => (
  [...tasks]
    .filter((task) => task.status.toLowerCase() === 'done' && taskDevSeconds(task) > 0)
    .sort((left, right) => {
      const leftEfficiency = taskEstimatedHoursFromPoints(left) / (taskDevSeconds(left) / 3600);
      const rightEfficiency = taskEstimatedHoursFromPoints(right) / (taskDevSeconds(right) / 3600);

      return rightEfficiency - leftEfficiency;
    })
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      title: task.title,
      jiraId: task.jiraId || null,
      efficiency: Number(((taskEstimatedHoursFromPoints(task) / (taskDevSeconds(task) / 3600)) * 100).toFixed(2)),
      estimatedHours: taskEstimatedHoursFromPoints(task),
      totalSeconds: taskDevSeconds(task)
    }))
);

export const calculateSprintMetrics = (tasks: Task[], currentSprintId?: string) => {
  const sprintTasks = filterTasksBySprint(tasks, [], currentSprintId);
  const completedTasks = sprintTasks.filter(t => t.status.toLowerCase() === 'done');
  
  const totalTimeSpent = sprintTasks.reduce((acc, t) => acc + t.totalSeconds, 0);
  
  return {
    sprintTasks,
    completedTasks,
    totalTimeSpent,
    efficiency: calculateEfficiency(sprintTasks)
  };
};

export const buildAnalyticsSnapshots = (tasks: Task[], sprints: Sprint[]): AnalyticsSnapshot[] => {
  const updatedAt = Date.now();
  const completedTasks = tasks.filter((task) => task.status.toLowerCase() === 'done');
  const totalTimeSpent = tasks.reduce((total, task) => total + task.totalSeconds, 0);
  const topPerformingTasks = calculateTopPerformingTasks(tasks);
  const productivityPeriods: ProductivityPeriod[] = ['day', 'week', 'month'];

  const sprintMap = new Map<string, Sprint>();
  sprints.forEach((sprint) => sprintMap.set(sprint.id, sprint));

  tasks.forEach((task) => {
    if (task.sprintId && !sprintMap.has(task.sprintId)) {
      sprintMap.set(task.sprintId, {
        id: task.sprintId,
        name: task.sprintName || task.sprintId,
        startDate: '',
        endDate: '',
        capacityHours: 0,
        isCurrent: false,
        updatedAt
      });
    }
  });

  const sprintSnapshots = Array.from(sprintMap.values()).map((sprint) => {
    const sprintTasks = filterTasksBySprint(tasks, Array.from(sprintMap.values()), sprint.id);
    const sprintCompletedTasks = sprintTasks.filter((task) => task.status.toLowerCase() === 'done');
    const sprintTotalTime = sprintTasks.reduce((total, task) => total + task.totalSeconds, 0);
    const velocityPoints = sprintCompletedTasks.reduce((total, task) => total + task.estimatedPoints, 0);
    const completionRate = sprintTasks.length > 0
      ? Math.round((sprintCompletedTasks.length / sprintTasks.length) * 100)
      : 0;

    return {
      snapshotId: `sprint:${sprint.id}`,
      snapshotType: 'sprint' as const,
      sprintId: sprint.id,
      period: null,
      taskCount: sprintTasks.length,
      completedTaskCount: sprintCompletedTasks.length,
      payload: {
        sprint: {
          id: sprint.id,
          name: sprint.name,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          capacityHours: sprint.capacityHours,
          isCurrent: sprint.isCurrent
        },
        totalTimeSpent: sprintTotalTime,
        totalTimeSpentSeconds: sprintTotalTime,
        efficiency: calculateEfficiency(sprintTasks),
        velocityPoints,
        completionRate,
        chartData: buildSprintChartData(sprintTasks)
      },
      updatedAt
    };
  });

  const productivitySnapshots = productivityPeriods.map((period) => {
    const chartData = buildProductivityChartData(tasks, period);
    const bestEfficiency = topPerformingTasks[0]?.efficiency ?? null;
    const averageTaskHours = tasks.length > 0 ? Number((totalTimeSpent / tasks.length / 3600).toFixed(2)) : 0;

    return {
      snapshotId: `productivity:${period}`,
      snapshotType: 'productivity' as const,
      sprintId: null,
      period,
      taskCount: tasks.length,
      completedTaskCount: completedTasks.length,
      payload: {
        period,
        chartData,
        topPerformingTasks,
        highlights: {
          averageTaskHours,
          bestEfficiencyPercent: bestEfficiency
        }
      },
      updatedAt
    };
  });

  return [
    {
      snapshotId: 'global:summary',
      snapshotType: 'global',
      sprintId: null,
      period: null,
      taskCount: tasks.length,
      completedTaskCount: completedTasks.length,
      payload: {
        totalTimeSpentSeconds: totalTimeSpent,
        totalEstimatedHours: Number(tasks.reduce((total, task) => total + taskEstimatedHoursFromPoints(task), 0).toFixed(2)),
        efficiency: calculateEfficiency(tasks),
        topPerformingTasks,
        currentSprintId: sprints.find((sprint) => sprint.isCurrent)?.id ?? null
      },
      updatedAt
    },
    ...sprintSnapshots,
    ...productivitySnapshots
  ];
};
