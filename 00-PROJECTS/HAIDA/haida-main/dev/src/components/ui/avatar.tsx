import * as React from 'react';
import { cn } from './utils';

export const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900', className)}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-xs font-medium', className)} {...props} />
));
AvatarFallback.displayName = 'AvatarFallback';
