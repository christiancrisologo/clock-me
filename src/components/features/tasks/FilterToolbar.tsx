import React from 'react';
import { cn } from '../../../lib/utils';
import { Sprint } from '../../../types';

interface FilterToolbarProps {
  statsFilter: 'sprint' | 'date';
  setStatsFilter: (filter: 'sprint' | 'date') => void;
  selectedSprintId: string;
  setSelectedSprintId: (id: string) => void;
  sprints: Sprint[];
  dateFrom: string;
  setDateFrom: (date: string) => void;
  dateTo: string;
  setDateTo: (date: string) => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  statsFilter,
  setStatsFilter,
  selectedSprintId,
  setSelectedSprintId,
  sprints,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo
}) => {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Filter by:</span>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {(['sprint', 'date'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatsFilter(f)}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 text-[9px] sm:text-[10px] font-bold rounded-md transition-all uppercase tracking-wider",
                statsFilter === f ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {statsFilter === 'sprint' && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Sprint:</span>
          <select 
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            className="text-xs font-bold border border-slate-200 rounded-lg px-2.5 sm:px-3 py-2 bg-white outline-none focus:border-brand-500 flex-1 sm:flex-none min-h-[44px] sm:min-h-auto"
          >
            <option value="all">All Sprints</option>
            {sprints.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {statsFilter === 'date' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">From:</span>
            <input 
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-lg px-2.5 sm:px-3 py-2 bg-white outline-none focus:border-brand-500 flex-1 sm:flex-none min-h-[44px] sm:min-h-auto"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">To:</span>
            <input 
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-lg px-2.5 sm:px-3 py-2 bg-white outline-none focus:border-brand-500 flex-1 sm:flex-none min-h-[44px] sm:min-h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
