import { useState, useEffect } from 'react';
import { Sprint } from '../types';
import { LS_NAME_SPRINT, INITIAL_SPRINT } from '../constants';

export const useSprints = (userId: string) => {
  const sprintStorageKey = `${LS_NAME_SPRINT}:${userId}`;

  const [sprints, setSprints] = useState<Sprint[]>(() => {
    const savedNew = localStorage.getItem(sprintStorageKey);
    if (savedNew) {
      const parsed = JSON.parse(savedNew);
      return parsed.map((s: any) => ({
        ...s,
        updatedAt: s.updatedAt || Date.now(),
        userId: s.userId || userId
      }));
    }

    const savedOld = localStorage.getItem('TITO-sprints');
    if (savedOld) {
      console.log('Migrating sprints from old localStorage key...');
      const parsed = JSON.parse(savedOld);
      return parsed.map((s: any) => ({
        ...s,
        updatedAt: s.updatedAt || Date.now()
      }));
    }

    return [{ ...INITIAL_SPRINT, userId }];
  });

  useEffect(() => {
    localStorage.setItem(sprintStorageKey, JSON.stringify(sprints));
  }, [sprintStorageKey, sprints]);

  const currentSprint = sprints.find(s => s.isCurrent);

  return {
    sprints,
    setSprints,
    currentSprint
  };
};
