import { useState, useEffect } from 'react';
import { AppView, VIEWS } from '../constants';

export const useUIState = () => {
  const [view, setView] = useState<AppView>(() => {
    const saved = localStorage.getItem('clock-me-view');
    return (saved as any) || VIEWS.TASKS;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('clock-me-sidebar-open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isStatsMinimized, setIsStatsMinimized] = useState(() => {
    const saved = localStorage.getItem('clock-me-stats-minimized');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('clock-me-view', view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('clock-me-sidebar-open', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('clock-me-stats-minimized', JSON.stringify(isStatsMinimized));
  }, [isStatsMinimized]);

  return {
    view,
    setView,
    isSidebarOpen,
    setIsSidebarOpen,
    isStatsMinimized,
    setIsStatsMinimized
  };
};
