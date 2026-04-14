import { useState, useEffect } from 'react';
import { Sprint } from '../types';
import { LS_NAME_SPRINT, INITIAL_SPRINT } from '../constants';

export const useSprints = () => {
  const [sprints, setSprints] = useState<Sprint[]>(() => {
    const savedNew = localStorage.getItem(LS_NAME_SPRINT);
    if (savedNew) {
      const parsed = JSON.parse(savedNew);
      return parsed.map((s: any) => ({
        ...s,
        updatedAt: s.updatedAt || Date.now()
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

    return [INITIAL_SPRINT];
  });

  useEffect(() => {
    localStorage.setItem(LS_NAME_SPRINT, JSON.stringify(sprints));
  }, [sprints]);

  const currentSprint = sprints.find(s => s.isCurrent);

  return {
    sprints,
    setSprints,
    currentSprint
  };
};
