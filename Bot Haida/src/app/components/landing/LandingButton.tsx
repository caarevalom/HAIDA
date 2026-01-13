import React from 'react';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';

interface LandingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export const LandingButton = ({ 
  className, 
  variant = 'primary', 
  children, 
  ...props 
}: LandingButtonProps) => {
  const variants = {
    primary: "bg-gradient-to-r from-[#38f2a1] to-[#2aa3ff] text-[#0b0f14] font-bold shadow-[0_0_20px_rgba(56,242,161,0.3)] hover:shadow-[0_0_30px_rgba(42,163,255,0.5)] border-none",
    secondary: "bg-[#101722] text-[#e8eef7] border border-[#1a2331] hover:bg-[#1a2331] hover:border-[#38f2a1]/50",
    outline: "bg-transparent text-[#e8eef7] border border-[#1a2331] hover:border-[#38f2a1]"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
