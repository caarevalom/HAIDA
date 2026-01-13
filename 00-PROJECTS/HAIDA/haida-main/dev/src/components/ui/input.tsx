import * as React from 'react';
import { cn } from './utils';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';
