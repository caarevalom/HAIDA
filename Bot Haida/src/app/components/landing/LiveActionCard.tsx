import React from 'react';
import { motion } from 'motion/react';

interface LiveActionCardProps {
  title: string;
  subtitle?: string;
  onClick?: () => void;
  color: string; // CSS variable or hex color
  animationType: 'nova' | 'dashboard' | 'orders' | 'apps';
}

export const LiveActionCard = ({ title, subtitle, onClick, color, animationType }: LiveActionCardProps) => {
  
  const renderAnimation = () => {
    switch (animationType) {
      case 'nova':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute w-8 h-8 rounded-full blur-lg"
              style={{ backgroundColor: color }}
            />
            <motion.div 
              animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-6 h-6 border rounded-full flex items-center justify-center"
              style={{ borderColor: color }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            </motion.div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="relative w-full h-full flex items-end justify-center gap-0.5 pb-2 px-2">
            {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: [`${h * 20}px`, `${h * 30}px`, `${h * 20}px`] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-1.5 rounded-t-[1px] opacity-80"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        );
      case 'orders':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center gap-1.5 p-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.2, repeat: Infinity, repeatDelay: 2 }}
                className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden"
              >
                <motion.div 
                  className="h-full w-1/2"
                  style={{ backgroundColor: color }}
                />
              </motion.div>
            ))}
          </div>
        );
      case 'apps':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Abstract 'App Grid' Icon - Visual only, not interactive buttons */}
            <div className="grid grid-cols-3 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.3, scale: 0.8 }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    delay: (i % 3) * 0.2 + (Math.floor(i / 3) * 0.2) 
                  }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-2 group">
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={onClick}
        className="relative w-full aspect-square overflow-hidden rounded-xl bg-slate-500/10 border border-slate-500/20 hover:border-blue-600/50 hover:bg-slate-500/15 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
      >
        {/* Background Glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
        />
        
        {/* Animation Area - Centered */}
        <div className="relative z-10 w-full h-full p-2">
          {renderAnimation()}
        </div>
      </motion.button>

      {/* Content Area - Outside & Below */}
      <div className="flex flex-col items-center text-center space-y-0.5">
        <h3 className="text-xs font-bold text-foreground tracking-wide group-hover:text-blue-600 transition-colors">{title}</h3>
        {subtitle && <p className="text-[9px] text-muted-foreground/70 uppercase tracking-wider font-mono">{subtitle}</p>}
      </div>
    </div>
  );
};