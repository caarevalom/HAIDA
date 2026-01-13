import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Play, HelpCircle, Activity, Heart, Hash, User, Link as LinkIcon, Unlink, Radio, Folder, FolderPlus, FolderOpen, Archive, PlayCircle, Repeat, XCircle, FileText, FileBarChart, Bell, BellOff, Mail, AlertTriangle, MessageSquare, Search, Info, Settings, BarChart3, Database } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface CommandCardProps {
  name: string;
  command: string;
  telegramLink?: string;
}

const getIconForCommand = (command: string) => {
  // Map for HAIDA commands with Lucide icons
  const iconMap: Record<string, typeof Play> = {
    // Base Commands
    '/start': Play,
    '/help': HelpCircle,
    '/status': Activity,
    '/health': Heart,
    '/version': Hash,
    '/whoami': User,
    '/link': LinkIcon,
    '/unlink': Unlink,
    '/ping': Radio,
    // Projects
    '/projects': Folder,
    '/project': FolderOpen,
    '/project create': FolderPlus,
    '/project archive': Archive,
    // Executions
    '/runs': PlayCircle,
    '/run': Play,
    '/run_status': Activity,
    '/cancel_run': XCircle,
    '/rerun': Repeat,
    // Reports
    '/reports': FileBarChart,
    '/report': FileText,
    '/last_report': FileText,
    // Alerts
    '/subscribe': Bell,
    '/unsubscribe': BellOff,
    '/subscriptions': Mail,
    '/alerts': AlertTriangle,
    // AI
    '/chat': MessageSquare,
    '/perplexity': Search,
    // Admin
    '/webhook_info': Info,
    '/set_webhook': Settings,
    '/metrics': BarChart3,
    '/db': Database,
  };
  return iconMap[command] || Activity;
};

export const CommandCard = ({ name, command, telegramLink }: CommandCardProps) => {
  const [copied, setCopied] = useState(false);
  const IconComponent = getIconForCommand(command);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(command);
    setCopied(true);
    toast.success(`Copied: ${command}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    if (telegramLink) window.open(telegramLink, '_blank');
  };

  return (
    <motion.button
      layout
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleOpen}
      className="group relative flex flex-col items-center justify-center w-full aspect-square p-2.5 rounded-xl glass-strong hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Shimmer Effect on Hover */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-blue-400/10 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={{ 
          x: [-100, 200],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "linear"
        }}
      />
      
      {/* Gradient Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-400/10 rounded-xl" />
      
      {/* Icon - Larger and more dynamic */}
      <motion.div 
        className="relative z-10 text-blue-600 dark:text-blue-400 mb-2 filter drop-shadow-md group-hover:drop-shadow-lg transition-all duration-300"
        whileHover={{ rotate: [0, -8, 8, 0], scale: 1.15 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <IconComponent size={32} strokeWidth={2.5} />
      </motion.div>

      {/* Command Text with better contrast */}
      <div className="relative z-10 flex flex-col items-center gap-1 w-full px-1">
        <code className="text-[10px] font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight bg-slate-900/5 dark:bg-white/10 px-2 py-1 rounded-md border border-slate-900/10 dark:border-white/10 backdrop-blur-sm leading-none shadow-sm">
          {command}
        </code>
        <span className="text-[8px] uppercase tracking-wider text-slate-700 dark:text-slate-300 font-semibold leading-none truncate w-full text-center px-0.5">
          {name}
        </span>
      </div>

      {/* Copy Action Overlay (Top Right) */}
      <motion.div
        role="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-lg glass-strong text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white border-0 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Copy"
      >
        {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} strokeWidth={2.5} />}
      </motion.div>

      {/* Link Indicator (Bottom Right) */}
      {telegramLink && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-70 text-blue-600 dark:text-blue-400 transition-opacity">
           <ExternalLink size={11} strokeWidth={2.5} />
        </div>
      )}
    </motion.button>
  );
};