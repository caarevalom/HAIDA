import React from 'react';
import { motion } from 'motion/react';
import { Home, Terminal, Grid, HelpCircle } from 'lucide-react';
import { UsageGuide } from './UsageGuide';

export const BottomNav = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90%] sm:max-w-md">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        className="flex items-center justify-between px-6 py-3 rounded-full bg-background/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ring-1 ring-white/5"
      >
        <button 
          onClick={() => scrollToSection('hero')}
          className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-blue-600 transition-colors"
        >
          <Home size={20} />
        </button>

        <div className="w-px h-6 bg-border/20" />

        <button 
          onClick={() => scrollToSection('capabilities')}
          className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-green-600 transition-colors"
        >
          <Grid size={20} />
        </button>

        <div className="w-px h-6 bg-border/20" />

        <button 
          onClick={() => scrollToSection('command-surface')}
          className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-cyan-500 transition-colors"
        >
          <Terminal size={20} />
        </button>

        <div className="w-px h-6 bg-border/20" />

        <UsageGuide 
          trigger={
            <button className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle size={20} />
            </button>
          }
        />
      </motion.div>
    </div>
  );
};