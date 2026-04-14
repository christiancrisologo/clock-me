import { Task } from '../types';

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
