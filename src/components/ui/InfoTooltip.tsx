import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  content: React.ReactNode;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative inline-block ml-1">
      <button 
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-brand-600 transition-colors"
      >
        <Info size={14} />
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
          <p className="font-bold border-b border-slate-700 pb-1 mb-1 uppercase tracking-wider">{title}</p>
          <div className="space-y-1 text-slate-300 leading-relaxed">
            {content}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};
