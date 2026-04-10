import { useState, useEffect } from 'react';
import { Sprint } from '../types';
import { INITIAL_SPRINT } from '../constants';

export const useSprints = () => {
  const [sprints, setSprints] = useState<Sprint[]>(() => {
    const saved = localStorage.getItem('TITO-sprints');
    const parsed = saved ? JSON.parse(saved) : [INITIAL_SPRINT];
    return parsed.map((s: any) => ({
      ...s,
      updatedAt: s.updatedAt || Date.now()
    }));
  });

  useEffect(() => {
    localStorage.setItem('TITO-sprints', JSON.stringify(sprints));
  }, [sprints]);

  const currentSprint = sprints.find(s => s.isCurrent);

  return {
    sprints,
    setSprints,
    currentSprint
  };
};
