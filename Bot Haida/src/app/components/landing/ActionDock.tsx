import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Terminal, LayoutDashboard, ExternalLink } from 'lucide-react';
import { cn } from '../ui/utils';

interface DockItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
  delay?: number;
}

const DockItem = ({ icon, label, onClick, color, delay = 0 }: DockItemProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="group relative flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl glass-button transition-all duration-300 min-w-[120px] flex-1 sm:flex-none overflow-hidden"
    >
      {/* Shimmer on Hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ 
          background: `linear-gradient(120deg, transparent 0%, ${color}15 50%, transparent 100%)` 
        }}
        animate={{ x: [-200, 200] }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          repeatDelay: 0.5,
          ease: "linear"
        }}
      />

      {/* Icon with specific animation on hover */}
      <div className="relative z-10 transition-all duration-300" style={{ color: color }}>
        <motion.div
            whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.4 }}
        >
            {icon}
        </motion.div>
      </div>
      
      {/* Label */}
      <span className="relative z-10 text-xs sm:text-sm font-semibold text-foreground tracking-wide transition-colors duration-300">
        {label}
      </span>

      {/* Active Indicator */}
      <motion.div 
        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
        style={{ backgroundColor: color }}
        whileHover={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
    </motion.button>
  );
};

export const ActionDock = () => {
  return (
    <div className="inline-flex flex-wrap sm:flex-nowrap items-center justify-center p-2 gap-2 rounded-2xl glass-strong shadow-xl mx-auto max-w-full sm:w-auto">
      <DockItem 
        icon={<MessageSquare size={18} />}
        label="Telegram"
        color="#3B82F6"
        onClick={() => window.open('https://t.me/haida_bot', '_blank')}
        delay={0.1}
      />
      <div className="hidden sm:block w-px h-6 bg-border" />
      <DockItem 
        icon={<Terminal size={18} />}
        label="Commands"
        color="#0EA5E9"
        onClick={() => document.getElementById('command-surface')?.scrollIntoView({ behavior: 'smooth' })}
        delay={0.2}
      />
      <div className="hidden sm:block w-px h-6 bg-border" />
      <DockItem 
        icon={<LayoutDashboard size={18} />}
        label="Platform"
        color="#10B981"
        onClick={() => document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' })}
        delay={0.3}
      />
    </div>
  );
};