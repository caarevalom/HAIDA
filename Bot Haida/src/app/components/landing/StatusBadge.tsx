import React from 'react';
import { cn } from '../ui/utils';

type StatusType = 'healthy' | 'active' | 'warning' | 'neutral';

interface StatusBadgeProps {
  label: string;
  value: string;
  status?: StatusType;
  icon?: React.ReactNode;
}

export const StatusBadge = ({ label, value, status = 'neutral', icon }: StatusBadgeProps) => {
  const statusColors = {
    healthy: "bg-stayarta-teal/10 text-stayarta-teal border-stayarta-teal/20",
    active: "bg-stayarta-orange/10 text-stayarta-orange border-stayarta-orange/20",
    warning: "bg-stayarta-yellow/10 text-stayarta-yellow border-stayarta-yellow/20",
    neutral: "bg-secondary/50 text-muted-foreground border-border",
  };

  const dotColors = {
    healthy: "bg-stayarta-teal",
    active: "bg-stayarta-orange",
    warning: "bg-stayarta-yellow",
    neutral: "bg-muted-foreground",
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-medium backdrop-blur-sm",
      statusColors[status]
    )}>
      <span className={cn("w-2 h-2 rounded-full animate-pulse", dotColors[status])} />
      <span className="opacity-70">{label}:</span>
      <span>{value}</span>
      {icon && <span className="ml-1">{icon}</span>}
    </div>
  );
};
