import { format } from 'date-fns';
import { Sprint, Task } from '../types';

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

export const calculateEfficiency = (tasks: Task[]) => {
  const totalEst = tasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const devSec = tasks.reduce((acc, t) => {
    if (t.classification === 'sprintly') {
      // For sprintly tasks, we only count time spent in 'In progress'
      return acc + (t.phaseSeconds['In progress'] || 0);
    }
    // For regular tasks, total time spent is considered dev time
    return acc + t.totalSeconds;
  }, 0);
  
  const completedEst = tasks
    .filter(t => t.status.toLowerCase() === 'done')
    .reduce((acc, t) => acc + t.estimatedHours, 0);

  return totalEst > 0 ? (completedEst / (devSec / 3600 || 1)) : 0;
};

export const buildSprintChartData = (tasks: Task[]) => tasks.map((task) => {
  const dev = task.classification === 'sprintly'
    ? (task.phaseSeconds['In progress'] || 0)
    : task.totalSeconds;
  const wait = task.classification === 'sprintly'
    ? ((task.phaseSeconds['Code Review'] || 0) + (task.phaseSeconds['Testing'] || 0))
    : 0;

  return {
    name: task.jiraId || task.title.substring(0, 8),
    dev: Number((dev / 3600).toFixed(2)),
    wait: Number((wait / 3600).toFixed(2)),
    estimated: task.estimatedHours
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

    const dev = task.classification === 'sprintly'
      ? (task.phaseSeconds['In progress'] || 0)
      : task.totalSeconds;
    const wait = task.classification === 'sprintly'
      ? ((task.phaseSeconds['Code Review'] || 0) + (task.phaseSeconds['Testing'] || 0))
      : 0;

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
    .filter((task) => task.status.toLowerCase() === 'done' && task.totalSeconds > 0)
    .sort((left, right) => {
      const leftEfficiency = left.estimatedHours / (left.totalSeconds / 3600);
      const rightEfficiency = right.estimatedHours / (right.totalSeconds / 3600);

      return rightEfficiency - leftEfficiency;
    })
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      title: task.title,
      jiraId: task.jiraId || null,
      efficiency: Number(((task.estimatedHours / (task.totalSeconds / 3600)) * 100).toFixed(2)),
      estimatedHours: task.estimatedHours,
      totalSeconds: task.totalSeconds
    }))
);

export const calculateSprintMetrics = (tasks: Task[], currentSprintId?: string) => {
  const sprintTasks = tasks.filter(t => t.sprintId === currentSprintId);
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
    const sprintTasks = tasks.filter((task) => task.sprintId === sprint.id);
    const sprintCompletedTasks = sprintTasks.filter((task) => task.status.toLowerCase() === 'done');
    const sprintTotalTime = sprintTasks.reduce((total, task) => total + task.totalSeconds, 0);
    const velocityPoints = sprintCompletedTasks.reduce((total, task) => total + task.estimatedHours, 0);
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
        totalTimeSpent,
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
        totalEstimatedHours: Number(tasks.reduce((total, task) => total + task.estimatedHours, 0).toFixed(2)),
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
