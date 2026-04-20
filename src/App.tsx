import React, { useState } from 'react';
import { isSupabaseConfigured } from './lib/supabase';
import { cn } from './lib/utils';
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
import { AUTO_SYNC_DEFAULT, VIEWS } from './constants';
import { Task } from './types';

import { filterTasksBySprint } from './utils/metrics';
import { parseTasksFromCSV } from './utils/csv';
import { createSharedDashboardLink } from './utils/share';
import { CheckCircle, AlertCircle, Loader, FileUp } from 'lucide-react';
import { useAuth } from './hooks/useAuth';

interface AppProps {
  userId: string;
  isGuest: boolean;
  userName: string;
}

export default function App({ userId, isGuest, userName }: AppProps) {
  const { signOut } = useAuth();

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
  const [analyticsSprintId, setAnalyticsSprintId] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<{ current: number, total: number } | null>(null);

  // Domain State
  const { sprints, setSprints, currentSprint } = useSprints(userId);

  // 1. Initialize Sync state first to get setAutoSync and autoSync
  const [autoSync, setAutoSync] = useState(AUTO_SYNC_DEFAULT);

  // 2. We use a ref for sync handlers to avoid circular dependency
  const syncHandlersRef = React.useRef<{
    pushTaskToSupabase?: (task: Task) => Promise<void>;
    deleteTaskFromSupabase?: (taskId: string) => Promise<void>;
    syncWithSupabase?: (forcePush?: boolean) => Promise<void>;
  }>({});

  const taskHook = useTasks(syncHandlersRef.current, autoSync, userId);
  const {
    tasks,
    setTasks,
    activeTaskIds,
    addTask,
    addTasks,
    updateTask,
    toggleTimer,
    updateTaskStatus,
    deleteTask,
    deleteTasks
  } = taskHook;

  const activeSprints = React.useMemo(() => {
    const sprintNamesFromTasks = Array.from(new Set(tasks.map(t => t.sprintName).filter(Boolean))) as string[];

    // 1. Get managed sprints that actually have tasks
    const matchedSprints = sprints.filter(s => sprintNamesFromTasks.includes(s.name));

    // 2. Identify sprint names from tasks that aren't in our managed list
    const missingSprintNames = sprintNamesFromTasks.filter(name => !sprints.some(s => s.name === name));
    const missingSprints = missingSprintNames.map(name => ({
      id: name,
      name: name,
      isCurrent: false,
      startDate: '',
      endDate: '',
      capacityHours: 0,
      updatedAt: Date.now(),
      userId
    }));

    return [...matchedSprints, ...missingSprints].sort((a, b) => b.name.localeCompare(a.name));
  }, [sprints, tasks]);

  const sync = useSync(tasks, setTasks, sprints, setSprints, autoSync, userId, isGuest);
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

  React.useEffect(() => {
    if (activeSprints.length === 0) {
      if (analyticsSprintId) setAnalyticsSprintId('');
      return;
    }

    const selectedStillExists = activeSprints.some((sprint) => sprint.id === analyticsSprintId);
    if (selectedStillExists) return;

    const fallbackSprintId = currentSprint && activeSprints.some((sprint) => sprint.id === currentSprint.id)
      ? currentSprint.id
      : activeSprints[0].id;

    setAnalyticsSprintId(fallbackSprintId);
  }, [activeSprints, currentSprint, analyticsSprintId]);

  const handleTaskSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const submittedClassification = formData.get('classification');
    const safeClassification: 'regular' | 'sprintly' =
      submittedClassification === 'sprintly' || submittedClassification === 'regular'
        ? submittedClassification
        : (editingTask?.classification || addingTaskType);

    const data = {
      title: formData.get('title') as string,
      jiraId: formData.get('jiraId') as string,
      type: formData.get('type') as string,
      estimatedPoints: Number(formData.get('estimatedPoints')),
      sprintName: formData.get('sprintName') as string,
      sprintId: sprints.find(s => s.name === formData.get('sprintName'))?.id || '',
      targetDate: formData.get('targetDate') as string || undefined,
      createdAt: formData.get('createdAt') ? new Date(formData.get('createdAt') as string).getTime() : undefined,
      link: formData.get('link') as string || undefined,
      status: formData.get('status') as string || 'To do',
      classification: safeClassification
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
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (content) {
        const importedTasks = parseTasksFromCSV(content);

        if (importedTasks.length > 0) {
          const total = importedTasks.length;
          setImportProgress({ current: 0, total });

          // Map and default to sprintly
          const mappedTasks = importedTasks.map(t => ({
            ...t,
            classification: 'sprintly' as const,
            sprintId: activeSprints.find(s => s.name === t.sprintName)?.id || ''
          }));

          const result = await addTasks(mappedTasks, (current) => {
            setImportProgress({ current, total });
          });

          setImportProgress(null);
          setImportFile(null);

          if (result && result.addedCount > 0) {
            setNotification({
              message: `Successfully imported ${result.addedCount} tasks! ${result.duplicateCount > 0 ? `(${result.duplicateCount} duplicates skipped)` : ''}`,
              type: 'success'
            });
          } else if (result && result.duplicateCount > 0) {
            setNotification({
              message: `All ${result.duplicateCount} tasks in the CSV were already in your list.`,
              type: 'error'
            });
          }
          setTimeout(() => setNotification(null), 5000);
        } else {
          setImportFile(null);
          setNotification({
            message: "Failed to parse CSV. Please ensure it follows the correct format.",
            type: 'error'
          });
          setTimeout(() => setNotification(null), 5000);
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

  const selectedAnalyticsSprint = activeSprints.find((sprint) => sprint.id === analyticsSprintId);
  const sprintTasks = React.useMemo(
    () => filterTasksBySprint(tasks, activeSprints, analyticsSprintId),
    [tasks, activeSprints, analyticsSprintId]
  );

  const handleShareDashboard = async () => {
    const link = createSharedDashboardLink({
      version: 'v1',
      generatedAt: Date.now(),
      tasks: sprintTasks,
      sprints: selectedAnalyticsSprint
        ? [{ ...selectedAnalyticsSprint, isCurrent: true }]
        : activeSprints,
    });

    try {
      await navigator.clipboard.writeText(link);
      setNotification({
        message: 'Dashboard share link copied to clipboard.',
        type: 'success'
      });
    } catch {
      setNotification({
        message: `Share link: ${link}`,
        type: 'success'
      });
    }

    setTimeout(() => setNotification(null), 6000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50/50">
      <Sidebar
        isOpen={isSidebarOpen}
        currentView={view}
        setView={setView}
        onNavigate={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 overflow-y-auto h-screen md:ml-0">
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
          onSave={() => syncWithSupabase(true)}
          productivityPeriod={productivityPeriod}
          setProductivityPeriod={setProductivityPeriod}
          userName={userName}
          isGuest={isGuest}
          onLogout={() => void signOut()}
        />

        <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-full md:max-w-6xl mx-auto">
          {view === VIEWS.TASKS && (
            <TasksView
              tasks={tasks}
              sprints={activeSprints}
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
              onDeleteTasks={deleteTasks}
              onAddNewTask={() => {
                setAddingTaskType('regular');
                setIsAddingTask(true);
              }}
            />
          )}

          {view === VIEWS.DASHBOARD && (
            <AnalyticsDashboard
              sprintTasks={sprintTasks}
              currentSprint={selectedAnalyticsSprint}
              sprints={activeSprints}
              selectedSprintId={analyticsSprintId}
              onSelectSprint={setAnalyticsSprintId}
              onSync={syncWithSupabase}
              isSyncing={isSyncing}
              onShare={handleShareDashboard}
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
              isGuest={isGuest}
              userName={userName}
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
          sprints={activeSprints}
        />
      )}

      {/* CSV Import Modal */}
      {importFile && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                <FileUp size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Import CSV</h3>
                <p className="text-xs text-slate-500 font-medium">{importFile.name}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="py-4 space-y-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <Loader className="text-brand-600 animate-spin" size={48} strokeWidth={3} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-black text-brand-700">
                        {importProgress ? Math.round((importProgress.current / importProgress.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 tracking-tight">
                      {importProgress ? 'Processing Tasks...' : 'Initializing...'}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {importProgress ? `${importProgress.current} of ${importProgress.total} completed` : 'Reading file...'}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                    style={{ width: `${importProgress ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className={cn(
            "flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md",
            notification.type === 'success'
              ? "bg-green-500/90 border-green-400 text-white"
              : "bg-amber-500/90 border-amber-400 text-white"
          )}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-bold tracking-tight">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
