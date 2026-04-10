import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none font-bold";
  
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white shadow-sm",
    secondary: "bg-brand-50 hover:bg-brand-100 text-brand-700",
    outline: "border border-slate-200 hover:border-brand-200 hover:bg-brand-50 text-slate-600",
    ghost: "hover:bg-slate-100 text-slate-500",
    danger: "border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600",
    amber: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "w-10 h-10 rounded-xl",
    "icon-sm": "w-9 h-9 rounded-xl",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      {...props}
    >
      {children}
    </button>
  );
};
