import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FiberTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const FiberTextarea = forwardRef<HTMLTextAreaElement, FiberTextareaProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div className="group relative">
        {label && (
          <label className="font-mono text-[10px] uppercase text-slate-500 mb-2 block tracking-widest">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-none border-transparent resize-none",
            "bg-white/[0.03] border border-white/10",
            "transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
            "text-white placeholder:text-slate-500",
            "focus:outline-none focus:border-indigo-500 focus:bg-white/[0.05]",
            "focus:shadow-[0_0_20px_rgba(99,102,241,0.1)]",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

FiberTextarea.displayName = 'FiberTextarea';
