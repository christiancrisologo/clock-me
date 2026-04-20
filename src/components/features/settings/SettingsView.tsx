import React, { useState } from 'react';
import {
  Database,
  Cloud,
  CloudOff,
  RefreshCw,
  Save,
  Download,
  Upload,
  ChevronRight,
  Info,
  User
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';

interface SettingsViewProps {
  isSupabaseOnline: boolean;
  isSupabaseConfigured: boolean;
  isSyncing: boolean;
  autoSync: boolean;
  setAutoSync: (val: boolean) => void;
  lastSyncTime: number | null;
  onSync: (forcePush?: boolean) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  isGuest?: boolean;
  userName?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isSupabaseOnline,
  isSupabaseConfigured,
  isSyncing,
  autoSync,
  setAutoSync,
  lastSyncTime,
  onSync,
  onExport,
  onImport,
  isGuest,
  userName
}) => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-brand-600 text-white rounded-2xl shadow-lg shadow-brand-100 flex-shrink-0">
              <Database size={24} className="sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-2xl font-black text-slate-900">Storage & Sync</h3>
              <p className="text-xs sm:text-sm text-slate-500">Manage your data synchronization with Supabase</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={cn(
                    "p-2 rounded-lg flex-shrink-0",
                    isSupabaseOnline ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  )}>
                    {isSupabaseOnline ? <Cloud size={18} /> : <CloudOff size={18} />}
                  </div>
                  <p className="font-bold text-slate-900 text-sm truncate">Supabase Connection</p>
                </div>
                <span className={cn(
                  "px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest flex-shrink-0",
                  isSupabaseOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {isGuest ? 'Guest' : isSupabaseOnline ? 'Connected' : 'Offline'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed">
                {isGuest
                  ? 'You are using guest mode. Data stays on this device until you sign in.'
                  : isSupabaseOnline
                  ? 'Successfully connected to Supabase. Cloud sync is active.'
                  : 'Could not connect to Supabase. Changes are being saved locally.'}
              </p>
            </div>

            <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-2 bg-brand-100 text-brand-600 rounded-lg flex-shrink-0">
                    <RefreshCw size={18} className={cn(isSyncing && "animate-spin")} />
                  </div>
                  <p className="font-bold text-slate-900 text-sm">Auto-Sync</p>
                </div>
                <button
                  onClick={() => isSupabaseOnline && !isGuest && setAutoSync(!autoSync)}
                  disabled={!isSupabaseOnline || isGuest}
                  className={cn(
                    "w-11 h-6 rounded-full transition-all relative flex-shrink-0",
                    autoSync && isSupabaseOnline ? "bg-brand-600" : "bg-slate-300",
                    (!isSupabaseOnline || isGuest) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                    autoSync && isSupabaseOnline ? "left-6" : "left-0.5"
                  )} />
                </button>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed">
                {isGuest ? 'Guest mode keeps all changes local until you sign in with Supabase.' : 'Automatically compare and merge data from Supabase whenever you resume a task timer.'}
              </p>
            </div>
          </div>

          {userName && (
            <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <p className="text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Current Session</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{userName}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">{isGuest ? 'Guest session' : 'Authenticated with Supabase'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Manual Synchronization</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => onSync()}
                disabled={!isSupabaseOnline || isSyncing || isGuest}
                className="flex items-center gap-2 sm:gap-4 p-3 sm:p-5 h-auto rounded-2xl border border-slate-200 hover:border-brand-200 hover:bg-brand-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed bg-white text-xs sm:text-sm"
              >
                <div className="p-2 sm:p-3 bg-white rounded-xl border border-slate-100 group-hover:border-brand-100 shadow-sm transition-all group-hover:scale-105 flex-shrink-0">
                  <RefreshCw size={18} className={cn("text-slate-400 group-hover:text-brand-600 sm:w-6 sm:h-6", isSyncing && "animate-spin")} />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">Sync Now</p>
                  <p className="text-[8px] sm:text-[10px] text-slate-500 font-medium">Merge local & remote</p>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => onSync(true)}
                disabled={!isSupabaseOnline || isSyncing || isGuest}
                className="flex items-center gap-2 sm:gap-4 p-3 sm:p-5 h-auto rounded-2xl border border-slate-200 hover:border-brand-200 hover:bg-brand-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed bg-white text-xs sm:text-sm"
              >
                <div className="p-2 sm:p-3 bg-white rounded-xl border border-slate-100 group-hover:border-brand-100 shadow-sm transition-all group-hover:scale-105 flex-shrink-0">
                  <Save size={18} className="text-slate-400 group-hover:text-brand-600 sm:w-6 sm:h-6" />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">Force Backup</p>
                  <p className="text-[8px] sm:text-[10px] text-slate-500 font-medium">Push local to cloud</p>
                </div>
              </Button>
            </div>
            {lastSyncTime && (
              <p className="text-[8px] sm:text-[10px] text-center text-slate-400 italic">
                Last successful sync: {new Date(lastSyncTime).toLocaleString()}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Data Management</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={onExport}
                className="flex items-center gap-4 p-5 h-auto rounded-2xl border border-slate-200 hover:border-brand-200 hover:bg-brand-50 transition-all group bg-white"
              >
                <div className="p-3 bg-white rounded-xl border border-slate-100 group-hover:border-brand-100 shadow-sm transition-all group-hover:scale-105">
                  <Download size={24} className="text-slate-400 group-hover:text-brand-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Export to CSV</p>
                  <p className="text-[10px] text-slate-500 font-medium">Download all your tasks</p>
                </div>
              </Button>

              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImport(file);
                    e.target.value = '';
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-4 p-5 h-auto rounded-2xl border border-slate-200 hover:border-brand-200 hover:bg-brand-50 transition-all group bg-white"
                >
                  <div className="p-3 bg-white rounded-xl border border-slate-100 group-hover:border-brand-100 shadow-sm transition-all group-hover:scale-105">
                    <Upload size={24} className="text-slate-400 group-hover:text-brand-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900">Import from CSV</p>
                    <p className="text-[10px] text-slate-500 font-medium">Bulk generate tasks</p>
                  </div>
                </Button>
              </>
            </div>
          </div>


          {!isSupabaseConfigured && (
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Info size={20} />
              </div>
              <div>
                <p className="font-bold text-amber-900">Supabase Not Configured</p>
                <p className="text-xs text-amber-700 leading-relaxed mt-1">
                  Cloud synchronization is currently disabled. To enable it, please provide your Supabase credentials in the <strong>Settings</strong> menu of AI Studio.
                </p>
                <div className="mt-3 flex flex-wrap gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <code className="text-[10px] font-bold text-amber-800">VITE_SUPABASE_URL</code>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <code className="text-[10px] font-bold text-amber-800">VITE_SUPABASE_ANON_KEY</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="group flex items-center gap-3 text-left w-full hover:bg-slate-50 p-4 rounded-xl transition-all"
            >
              <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">About the Author</p>
                <p className="text-[10px] text-slate-400">Discover more about Clock-Me and its creator</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-brand-600 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {isAboutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="relative h-24 bg-brand-600 overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-white rounded-full" />
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white rounded-full" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Database size={40} className="text-white/20" />
              </div>
            </div>

            <div className="relative -mt-12 px-8 pb-8">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4 mx-auto border-4 border-white">
                <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center text-brand-600 font-black text-2xl">
                  CC
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Christian Crisologo</h3>
                <p className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 inline-block px-3 py-1 rounded-full">Senior Software Engineer</p>

                <div className="pt-4 text-sm text-slate-600 leading-relaxed font-medium">
                  Author of Clock-Me, focusing on high-performance developer tools and rich productivity experiences.
                </div>

                <div className="pt-6 flex gap-3">
                  <Button
                    variant="primary"
                    className="w-full text-xs font-black h-12 rounded-xl shadow-lg shadow-brand-100"
                    onClick={() => setIsAboutOpen(false)}
                  >
                    Close Dialog
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
