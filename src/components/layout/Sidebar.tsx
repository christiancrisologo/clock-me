import React from 'react';
import {
  Clock,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppView, VIEWS } from '../../constants';
import { Sprint } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  currentView: AppView;
  setView: (view: AppView) => void;
  onNavigate?: () => void;
  currentSprint?: Sprint;
  completedTasksCount?: number;
  totalTasksInSprint?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  currentView,
  setView,
  onNavigate,
}) => {
  const handleNavigate = (view: AppView) => {
    setView(view);
    if (window.matchMedia('(max-width: 767px)').matches) {
      onNavigate?.();
    }
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-[1px] transition-opacity duration-300 md:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onNavigate}
        aria-hidden="true"
      />

      <aside className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 flex flex-col transition-[transform,width] duration-300 ease-out',
        'w-[82vw] max-w-xs md:static md:z-auto',
        isOpen
          ? 'translate-x-0 md:w-64'
          : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-r-0'
      )}>
      <div className="p-4 sm:p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
            <Clock size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">Clock-Me</h1>
            <span className="text-xs tracking-tight text-slate-500">productivity tracker</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavButton
          icon={<LayoutDashboard size={20} />}
          label="Tasks"
          active={currentView === VIEWS.TASKS}
          onClick={() => handleNavigate(VIEWS.TASKS)}
        />
        <NavButton
          icon={<BarChart3 size={20} />}
          label="Sprint Analytics"
          active={currentView === VIEWS.DASHBOARD}
          onClick={() => handleNavigate(VIEWS.DASHBOARD)}
        />
        <NavButton
          icon={<TrendingUp size={20} />}
          label="Global Productivity"
          active={currentView === VIEWS.PRODUCTIVITY}
          onClick={() => handleNavigate(VIEWS.PRODUCTIVITY)}
        />
        <NavButton
          icon={<Settings size={20} />}
          label="Settings"
          active={currentView === VIEWS.SETTINGS}
          onClick={() => handleNavigate(VIEWS.SETTINGS)}
        />
      </nav>
      </aside>
    </>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
      active ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-500 hover:bg-slate-50"
    )}
  >
    {icon}
    {label}
  </button>
);
