import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

interface InfoDialogProps {
  title: string;
  content: React.ReactNode;
}

export const InfoDialog: React.FC<InfoDialogProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-slate-400 hover:text-brand-600 transition-colors ml-1"
      >
        <Info size={14} />
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Info size={14} className="sm:w-4 sm:h-4 text-brand-600" />
                {title}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 sm:space-y-3">
              {content}
            </div>
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-3 sm:px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-colors h-10 sm:h-auto min-h-[44px] sm:min-h-auto flex items-center"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
