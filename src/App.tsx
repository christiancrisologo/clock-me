import React, { useState } from 'react';
import { isSupabaseConfigured } from './lib/supabase';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TasksView } from './components/features/tasks/TasksView';
import { AnalyticsDashboard } from './components/features/analytics/AnalyticsDashboard';
import { ProductivityView } from './components/features/productivity/ProductivityView';
import { SettingsView } from './components/features/settings/SettingsView';
import { TaskForm } from './components/features/tasks/TaskForm';
import { useSprints } from './hooks/useSprints';
import { useTasks } from './hooks/useTasks';
import { useSync } from './hooks/useSync';
import { useTimer } from './hooks/useTimer';
import { useUIState } from './hooks/useUIState';
import { VIEWS, LS_NAME_TASK } from './constants';
import { Task } from './types';

import { calculateSprintMetrics } from './utils/metrics';
import { parseTasksFromCSV } from './utils/csv';

export default function App() {
  // UI State
  const { 
    view, setView, 
    isSidebarOpen, setIsSidebarOpen, 
    isStatsMinimized, setIsStatsMinimized 
  } = useUIState();

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [addingTaskType, setAddingTaskType] = useState<'regular' | 'sprintly'>('regular');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [productivityPeriod, setProductivityPeriod] = useState<'day' | 'week' | 'month'>('week');

  // Domain State
  const { sprints, setSprints, currentSprint } = useSprints();
  
  // 1. Initialize Sync state first to get setAutoSync and autoSync
  const [autoSync, setAutoSync] = useState(true);

  // 2. We use a ref for sync handlers to avoid circular dependency
  const syncHandlersRef = React.useRef<{
    pushTaskToSupabase?: (task: Task) => Promise<void>;
    deleteTaskFromSupabase?: (taskId: string) => Promise<void>;
    syncWithSupabase?: (forcePush?: boolean) => Promise<void>;
  }>({});
  
  // This hook now manages the 'tasks' state internally
  const taskHook = useTasks(syncHandlersRef.current, autoSync);
  const { 
    tasks, 
    setTasks, 
    activeTaskIds, 
    addTask, 
    addTasks, 
    updateTask, 
    toggleTimer, 
    updateTaskStatus, 
    deleteTask 
  } = taskHook;

  const sync = useSync(tasks, setTasks, sprints, setSprints);
  const {
    isSupabaseOnline,
    isSyncing,
    lastSyncTime,
    syncWithSupabase,
    pushTaskToSupabase,
    deleteTaskFromSupabase
  } = sync;

  // 3. Update the ref with current handlers from useSync
  React.useEffect(() => {
    syncHandlersRef.current = {
      pushTaskToSupabase,
      deleteTaskFromSupabase,
      syncWithSupabase
    };
  }, [pushTaskToSupabase, deleteTaskFromSupabase, syncWithSupabase]);

  // Custom Timer Hook
  useTimer(activeTaskIds, setTasks);
  
  const handleTaskSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      jiraId: formData.get('jiraId') as string,
      type: formData.get('type') as string,
      estimatedPoints: Number(formData.get('estimatedPoints')),
      sprintName: formData.get('sprintName') as string,
      sprintId: sprints.find(s => s.name === formData.get('sprintName'))?.id,
      targetDate: formData.get('targetDate') as string || undefined,
      createdAt: formData.get('createdAt') ? new Date(formData.get('createdAt') as string).getTime() : undefined,
      classification: addingTaskType
    };

    if (editingTask) {
      updateTask(editingTask.id, {
        ...data,
        totalSeconds: Number(formData.get('totalSeconds')) || editingTask.totalSeconds
      });
      setEditingTask(null);
    } else {
      addTask(data);
      setIsAddingTask(false);
    }
  };

  const handleImportCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const importedTasks = parseTasksFromCSV(content);
        if (importedTasks.length > 0) {
          // Map sprint names to sprint IDs if they exist
          const mappedTasks = importedTasks.map(t => ({
            ...t,
            sprintId: sprints.find(s => s.name === t.sprintName)?.id || ''
          }));
          addTasks(mappedTasks);
        }
      }
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    const headers = [
      'ID', 'Title', 'JIRA ID', 'Status', 'Type', 'Classification', 'Sprint Name',
      'Estimated Points', 'Estimated Hours', 'Total Seconds', 'Total Hours',
      'Created At', 'Updated At'
    ];

    const rows = tasks.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.jiraId || '',
      t.status,
      t.type,
      t.classification,
      t.sprintName || '',
      t.estimatedPoints,
      t.estimatedHours,
      t.totalSeconds,
      (t.totalSeconds / 3600).toFixed(2),
      new Date(t.createdAt).toISOString(),
      new Date(t.updatedAt).toISOString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clock-me-tasks-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const completedTasks = tasks.filter(t => t.status.toLowerCase() === 'done');
  const sprintTasks = tasks.filter(t => t.sprintId === currentSprint?.id);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        isOpen={isSidebarOpen}
        currentView={view}
        setView={setView}
        currentSprint={currentSprint}
        completedTasksCount={completedTasks.filter(t => t.sprintId === currentSprint?.id).length}
        totalTasksInSprint={sprintTasks.length}
      />

      <main className="flex-1 overflow-y-auto bg-slate-50/50 h-screen">
        <Header 
          view={view}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSupabaseOnline={isSupabaseOnline}
          isSyncing={isSyncing}
          onAddTask={(type) => {
            setAddingTaskType(type);
            setIsAddingTask(true);
          }}
          onSave={() => syncWithSupabase()}
          productivityPeriod={productivityPeriod}
          setProductivityPeriod={setProductivityPeriod}
        />

        <div className="p-8 max-w-6xl mx-auto">
          {view === VIEWS.TASKS && (
            <TasksView 
              tasks={tasks}
              sprints={sprints}
              activeTaskIds={activeTaskIds}
              isStatsMinimized={isStatsMinimized}
              setIsStatsMinimized={setIsStatsMinimized}
              onToggleTimer={toggleTimer}
              onUpdateStatus={updateTaskStatus}
              onDeleteTask={deleteTask}
              onEditTask={(t) => {
                setEditingTask(t);
                setIsAddingTask(true);
              }}
              onAddNewTask={() => {
                setAddingTaskType('regular');
                setIsAddingTask(true);
              }}
            />
          )}

          {view === VIEWS.DASHBOARD && (
            <AnalyticsDashboard 
              sprintTasks={sprintTasks}
              currentSprint={currentSprint}
              efficiency={calculateSprintMetrics(tasks, currentSprint?.id).efficiency}
              onSync={syncWithSupabase}
              isSyncing={isSyncing}
            />
          )}

          {view === VIEWS.PRODUCTIVITY && (
            <ProductivityView tasks={tasks} period={productivityPeriod} />
          )}

          {view === VIEWS.SETTINGS && (
            <SettingsView 
              isSupabaseOnline={isSupabaseOnline}
              isSupabaseConfigured={isSupabaseConfigured}
              isSyncing={isSyncing}
              autoSync={autoSync}
              setAutoSync={setAutoSync}
              lastSyncTime={lastSyncTime}
              onSync={syncWithSupabase}
              onExport={exportToCSV}
              onImport={handleImportCSV}
            />
          )}
        </div>
      </main>

      {isAddingTask && (
        <TaskForm 
          task={editingTask}
          onClose={() => {
            setIsAddingTask(false);
            setEditingTask(null);
          }}
          onSubmit={handleTaskSubmit}
          addingTaskType={addingTaskType}
          sprints={sprints}
        />
      )}
    </div>
  );
}
