import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface WeaveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function WeaveButton({ children, variant = 'primary', className, ...props }: WeaveButtonProps) {
  return (
    <button
      className={cn(
        "relative overflow-hidden font-extrabold uppercase tracking-[0.1em] px-8 py-4 transition-all duration-400",
        "hover:transform hover:-translate-y-0.5",
        variant === 'primary' && "bg-white text-black hover:bg-indigo-500 hover:text-white hover:shadow-[0_10px_30px_rgba(99,102,241,0.3)]",
        variant === 'secondary' && "bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-indigo-500",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
