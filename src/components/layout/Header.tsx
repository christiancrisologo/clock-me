import React, { useState } from 'react';
import {
  ChevronLeft,
  Menu,
  CloudOff,
  RefreshCw,
  Plus,
  ChevronDown,
  Circle,
  Zap,
  Save
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AppView, VIEWS } from '../../constants';
import { Button } from '../ui/Button';

interface HeaderProps {
  view: AppView;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isSupabaseOnline: boolean;
  isSyncing: boolean;
  onAddTask: (type: 'regular' | 'sprintly') => void;
  onSave?: () => void;
  productivityPeriod?: 'day' | 'week' | 'month';
  setProductivityPeriod?: (period: 'day' | 'week' | 'month') => void;
}

export const Header: React.FC<HeaderProps> = ({
  view,
  isSidebarOpen,
  toggleSidebar,
  isSupabaseOnline,
  isSyncing,
  onAddTask,
  onSave,
  productivityPeriod,
  setProductivityPeriod
}) => {
  const [isNewTaskMenuOpen, setIsNewTaskMenuOpen] = useState(false);

  const getTitle = () => {
    switch (view) {
      case VIEWS.TASKS: return 'Task Management';
      case VIEWS.DASHBOARD: return 'Sprint Analytics';
      case VIEWS.PRODUCTIVITY: return 'Global Productivity';
      case VIEWS.SETTINGS: return 'Settings';
      default: return '';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case VIEWS.TASKS: return 'Track your active development tasks';
      case VIEWS.DASHBOARD: return 'Measure your sprint productivity and velocity';
      case VIEWS.PRODUCTIVITY: return 'Analyze your long-term efficiency across all sprints';
      case VIEWS.SETTINGS: return 'Manage your cloud synchronization and app preferences';
      default: return '';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          className="p-2"
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </Button>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{getTitle()}</h2>
          <p className="text-sm text-slate-500">{getSubtitle()}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {onSave && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            disabled={isSyncing}
            title="Save and Sync"
            className="p-2 hover:bg-slate-50 text-slate-500"
          >
            <Save size={18} className={isSyncing ? 'animate-pulse' : ''} />
          </Button>
        )}

        {view === VIEWS.SETTINGS && !isSupabaseOnline && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
            <CloudOff size={14} className="text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Offline Mode</span>
          </div>
        )}

        {view === VIEWS.TASKS && (
          <div className="relative">
            <Button
              onClick={() => setIsNewTaskMenuOpen(!isNewTaskMenuOpen)}
              className="gap-2"
            >
              <Plus size={18} />
              New Task
              <ChevronDown size={16} className={cn("transition-transform", isNewTaskMenuOpen && "rotate-180")} />
            </Button>

            {isNewTaskMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsNewTaskMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      onAddTask('regular');
                      setIsNewTaskMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Circle size={14} className="text-slate-400" />
                    Single Task
                  </button>
                  <button
                    onClick={() => {
                      onAddTask('sprintly');
                      setIsNewTaskMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Zap size={14} className="text-purple-500" />
                    Sprintly Task
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {view === VIEWS.PRODUCTIVITY && setProductivityPeriod && (
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['day', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setProductivityPeriod(p)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wider",
                  productivityPeriod === p ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
