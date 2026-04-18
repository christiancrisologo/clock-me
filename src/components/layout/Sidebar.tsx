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
  currentSprint?: Sprint;
  completedTasksCount: number;
  totalTasksInSprint: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  currentView,
  setView,
}) => {

  return (
    <aside className={cn(
      "bg-white border-r border-slate-200 flex flex-col transition-all duration-300 relative h-screen",
      isOpen ? "w-full md:w-64" : "w-0 md:w-0 overflow-hidden border-none"
    )}>
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
            <Clock size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Clock-Me</h1>
            <span className="text-xs tracking-tight text-slate-500">productivity tracker</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavButton
          icon={<LayoutDashboard size={20} />}
          label="Tasks"
          active={currentView === VIEWS.TASKS}
          onClick={() => setView(VIEWS.TASKS)}
        />
        <NavButton
          icon={<BarChart3 size={20} />}
          label="Sprint Analytics"
          active={currentView === VIEWS.DASHBOARD}
          onClick={() => setView(VIEWS.DASHBOARD)}
        />
        <NavButton
          icon={<TrendingUp size={20} />}
          label="Global Productivity"
          active={currentView === VIEWS.PRODUCTIVITY}
          onClick={() => setView(VIEWS.PRODUCTIVITY)}
        />
        <NavButton
          icon={<Settings size={20} />}
          label="Settings"
          active={currentView === VIEWS.SETTINGS}
          onClick={() => setView(VIEWS.SETTINGS)}
        />
      </nav>
    </aside>
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
