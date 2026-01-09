import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div className={cn(
      "relative overflow-hidden",
      "bg-[rgba(15,18,25,0.7)] backdrop-blur-xl",
      "border border-white/5",
      "before:absolute before:top-0 before:left-0 before:right-0 before:h-px",
      "before:bg-gradient-to-r before:from-transparent before:via-indigo-500/50 before:to-transparent",
      className
    )}>
      {children}
    </div>
  );
}
