import React from 'react';
import { 
  Database, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Save, 
  Download, 
  ChevronRight, 
  Info 
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
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isSupabaseOnline,
  isSupabaseConfigured,
  isSyncing,
  autoSync,
  setAutoSync,
  lastSyncTime,
  onSync,
  onExport
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-brand-600 text-white rounded-2xl shadow-lg shadow-brand-100">
              <Database size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Storage & Sync</h3>
              <p className="text-slate-500">Manage your data synchronization with Supabase</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isSupabaseOnline ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  )}>
                    {isSupabaseOnline ? <Cloud size={20} /> : <CloudOff size={20} />}
                  </div>
                  <p className="font-bold text-slate-900">Supabase Connection</p>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  isSupabaseOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {isSupabaseOnline ? 'Connected' : 'Offline Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isSupabaseOnline 
                  ? 'Successfully connected to Supabase. Cloud sync is active.' 
                  : 'Could not connect to Supabase. Changes are being saved locally.'}
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                    <RefreshCw size={20} className={cn(isSyncing && "animate-spin")} />
                  </div>
                  <p className="font-bold text-slate-900">Auto-Sync</p>
                </div>
                <button 
                  onClick={() => isSupabaseOnline && setAutoSync(!autoSync)}
                  disabled={!isSupabaseOnline}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    autoSync && isSupabaseOnline ? "bg-brand-600" : "bg-slate-300",
                    !isSupabaseOnline && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                    autoSync && isSupabaseOnline ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatically compare and merge data from Supabase whenever you resume a task timer.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Manual Synchronization</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => onSync()}
                disabled={!isSupabaseOnline || isSyncing}
                className="flex items-center gap-4 p-5 h-auto rounded-2xl border border-slate-200 hover:border-brand-200 hover:bg-brand-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                <div className="p-3 bg-white rounded-xl border border-slate-100 group-hover:border-brand-100 shadow-sm transition-all group-hover:scale-105">
                  <RefreshCw size={24} className={cn("text-slate-400 group-hover:text-brand-600", isSyncing && "animate-spin")} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Sync Now</p>
                  <p className="text-[10px] text-slate-500 font-medium">Merge local & remote data</p>
                </div>
              </Button>

              <Button 
                variant="outline" 
                onClick={() => onSync(true)}
                disabled={!isSupabaseOnline || isSyncing}
                className="flex items-center gap-4 p-5 h-auto rounded-2xl border border-slate-200 hover:border-brand-200 hover:bg-brand-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                <div className="p-3 bg-white rounded-xl border border-slate-100 group-hover:border-brand-100 shadow-sm transition-all group-hover:scale-105">
                  <Save size={24} className="text-slate-400 group-hover:text-brand-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Force Backup</p>
                  <p className="text-[10px] text-slate-500 font-medium">Push local data to cloud</p>
                </div>
              </Button>
            </div>
            {lastSyncTime && (
              <p className="text-[10px] text-center text-slate-400 italic">
                Last successful sync: {new Date(lastSyncTime).toLocaleString()}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Data Export</h4>
            <Button 
              variant="outline"
              onClick={onExport}
              className="w-full flex items-center justify-between p-5 h-auto rounded-2xl border border-slate-200 hover:border-brand-200 hover:bg-brand-50 transition-all group bg-white"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl border border-slate-100 group-hover:border-brand-100 shadow-sm transition-all group-hover:scale-105">
                  <Download size={24} className="text-slate-400 group-hover:text-brand-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Export to CSV</p>
                  <p className="text-[10px] text-slate-500 font-medium">Download all tasks and performance analytics</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-600 transition-colors" />
            </Button>
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
        </div>
      </div>
    </div>
  );
};
