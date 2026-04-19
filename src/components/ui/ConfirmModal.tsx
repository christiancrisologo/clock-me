import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'primary';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
          <div className={cn(
            "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto transition-transform hover:scale-110 duration-300 shadow-lg",
            variant === 'danger' ? "bg-red-50 text-red-500 shadow-red-100" : 
            variant === 'warning' ? "bg-amber-50 text-amber-500 shadow-amber-100" :
            "bg-brand-50 text-brand-500 shadow-brand-100"
          )}>
            <AlertTriangle size={28} className="sm:w-8 sm:h-8" />
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-6 bg-slate-50/50 border-t border-slate-100 flex gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            className="flex-1 rounded-xl h-10 sm:h-12 text-xs font-black uppercase tracking-wider"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            className="flex-1 rounded-xl h-10 sm:h-12 text-xs font-black uppercase tracking-wider shadow-lg shadow-red-100"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
