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
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by:</span>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {(['sprint', 'date'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatsFilter(f)}
              className={cn(
                "px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider",
                statsFilter === f ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {statsFilter === 'sprint' && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sprint:</span>
          <select 
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-brand-500 min-w-[140px]"
          >
            <option value="all">All Sprints</option>
            {sprints.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {statsFilter === 'date' && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From:</span>
            <input 
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To:</span>
            <input 
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
