import { useEffect, useRef } from 'react';
import { Task } from '../types';

export const useTimer = (
  activeTaskIds: string[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeTaskIds.length > 0) {
      timerRef.current = window.setInterval(() => {
        setTasks(prev => prev.map(t => {
          if (activeTaskIds.includes(t.id)) {
            const updatedTask = { ...t, totalSeconds: t.totalSeconds + 1 };
            if (t.classification === 'sprintly') {
              const currentPhase = t.status;
              const phaseSeconds = { ...t.phaseSeconds };
              phaseSeconds[currentPhase] = (phaseSeconds[currentPhase] || 0) + 1;
              updatedTask.phaseSeconds = phaseSeconds;
            }
            return updatedTask;
          }
          return t;
        }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTaskIds, setTasks]);

  return timerRef;
};
