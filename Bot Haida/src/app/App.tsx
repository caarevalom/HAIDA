import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { 
  Bot, 
  Terminal, 
  Activity,
  Zap,
  Globe,
  Sun,
  Moon,
  MessageSquare,
  LayoutDashboard,
  PlayCircle,
  FileText,
  Bell,
  Sparkles,
  Settings,
  FolderKanban
} from 'lucide-react';
import { LiveActionCard } from './components/landing/LiveActionCard';
import { InfoDrawer } from './components/landing/InfoDrawer';
import { StatusBadge } from './components/landing/StatusBadge';
import { CommandCard } from './components/landing/CommandCard';
import { motion } from 'motion/react';
import '../styles/index.css';

import { ActionDock } from './components/landing/ActionDock';
import { BottomNav } from './components/landing/BottomNav';
import { SettingsProvider, useSettings } from './context/SettingsContext';

// HAIDA Command Categories
const commandCategories = [
  {
    category: 'base',
    icon: Terminal,
    color: '#2563EB',
    commands: [
      { key: 'Start', command: '/start', telegramLink: 'https://t.me/haida_bot?start=start' },
      { key: 'Help', command: '/help', telegramLink: 'https://t.me/haida_bot?start=help' },
      { key: 'Status', command: '/status', telegramLink: 'https://t.me/haida_bot?start=status' },
      { key: 'Health', command: '/health', telegramLink: 'https://t.me/haida_bot?start=health' },
      { key: 'Version', command: '/version', telegramLink: 'https://t.me/haida_bot?start=version' },
      { key: 'Whoami', command: '/whoami', telegramLink: 'https://t.me/haida_bot?start=whoami' },
      { key: 'Link', command: '/link', telegramLink: 'https://t.me/haida_bot?start=link' },
      { key: 'Unlink', command: '/unlink', telegramLink: 'https://t.me/haida_bot?start=unlink' },
      { key: 'Ping', command: '/ping', telegramLink: 'https://t.me/haida_bot?start=ping' },
    ]
  },
  {
    category: 'projects',
    icon: FolderKanban,
    color: '#0EA5E9',
    commands: [
      { key: 'Projects', command: '/projects', telegramLink: 'https://t.me/haida_bot?start=projects' },
      { key: 'Project', command: '/project', telegramLink: 'https://t.me/haida_bot?start=project' },
      { key: 'ProjectCreate', command: '/project create', telegramLink: 'https://t.me/haida_bot?start=project_create' },
      { key: 'ProjectArchive', command: '/project archive', telegramLink: 'https://t.me/haida_bot?start=project_archive' },
    ]
  },
  {
    category: 'executions',
    icon: PlayCircle,
    color: '#16A34A',
    commands: [
      { key: 'Runs', command: '/runs', telegramLink: 'https://t.me/haida_bot?start=runs' },
      { key: 'Run', command: '/run', telegramLink: 'https://t.me/haida_bot?start=run' },
      { key: 'RunStatus', command: '/run_status', telegramLink: 'https://t.me/haida_bot?start=run_status' },
      { key: 'CancelRun', command: '/cancel_run', telegramLink: 'https://t.me/haida_bot?start=cancel_run' },
      { key: 'Rerun', command: '/rerun', telegramLink: 'https://t.me/haida_bot?start=rerun' },
    ]
  },
  {
    category: 'reports',
    icon: FileText,
    color: '#F59E0B',
    commands: [
      { key: 'Reports', command: '/reports', telegramLink: 'https://t.me/haida_bot?start=reports' },
      { key: 'Report', command: '/report', telegramLink: 'https://t.me/haida_bot?start=report' },
      { key: 'LastReport', command: '/last_report', telegramLink: 'https://t.me/haida_bot?start=last_report' },
    ]
  },
  {
    category: 'alerts',
    icon: Bell,
    color: '#3B82F6',
    commands: [
      { key: 'Subscribe', command: '/subscribe', telegramLink: 'https://t.me/haida_bot?start=subscribe' },
      { key: 'Unsubscribe', command: '/unsubscribe', telegramLink: 'https://t.me/haida_bot?start=unsubscribe' },
      { key: 'Subscriptions', command: '/subscriptions', telegramLink: 'https://t.me/haida_bot?start=subscriptions' },
      { key: 'Alerts', command: '/alerts', telegramLink: 'https://t.me/haida_bot?start=alerts' },
    ]
  },
  {
    category: 'ai',
    icon: Sparkles,
    color: '#2563EB',
    commands: [
      { key: 'Chat', command: '/chat', telegramLink: 'https://t.me/haida_bot?start=chat' },
      { key: 'Perplexity', command: '/perplexity', telegramLink: 'https://t.me/haida_bot?start=perplexity' },
    ]
  },
  {
    category: 'admin',
    icon: Settings,
    color: '#DC2626',
    commands: [
      { key: 'WebhookInfo', command: '/webhook_info', telegramLink: 'https://t.me/haida_bot?start=webhook_info' },
      { key: 'SetWebhook', command: '/set_webhook', telegramLink: 'https://t.me/haida_bot?start=set_webhook' },
      { key: 'Metrics', command: '/metrics', telegramLink: 'https://t.me/haida_bot?start=metrics' },
      { key: 'DB', command: '/db', telegramLink: 'https://t.me/haida_bot?start=db' },
    ]
  }
];

const AppContent = () => {
  const { t, theme, toggleTheme, toggleLanguage, language } = useSettings();
  const [activeTab, setActiveTab] = useState('commands');

  const handleAction = (action: string) => {
    console.log(`Action triggered: ${action}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-600/20 selection:text-blue-600 flex flex-col transition-colors duration-300">
      <Toaster position="top-center" theme={theme} toastOptions={{
        style: { background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }
      }} />

      {/* Background Elements - Liquid Glass style */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-500/10 via-blue-400/5 to-transparent rounded-[100%] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-gradient-to-t from-cyan-400/8 via-sky-300/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[400px] bg-gradient-to-r from-indigo-400/6 to-transparent rounded-full blur-3xl" />
        
        {/* Refined Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>
      
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 px-4 sm:px-6 py-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 glass-strong px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg overflow-hidden relative shadow-md group-hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
              <div className="absolute inset-0 bg-gradient-to-t from-blue-700/30 to-transparent" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs leading-none tracking-tight text-foreground group-hover:text-primary transition-colors">HAIDA</span>
              <span className="text-[8px] text-muted-foreground font-mono tracking-widest uppercase">QA Platform</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="pointer-events-auto flex items-center gap-2"
          >
             <button 
               onClick={toggleLanguage}
               className="p-2.5 rounded-lg glass-button text-muted-foreground hover:text-primary shadow-md"
               aria-label={t.aria.toggleLang}
             >
               <span className="text-[10px] font-mono font-bold">{language.toUpperCase()}</span>
             </button>
             <button 
               onClick={toggleTheme}
               className="p-2.5 rounded-lg glass-button text-muted-foreground hover:text-primary shadow-md"
               aria-label={t.aria.toggleTheme}
             >
               {theme === 'dark' ? <Sun size={14} strokeWidth={2.5} /> : <Moon size={14} strokeWidth={2.5} />}
             </button>
             <InfoDrawer />
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 pb-40">
        
        {/* Hero Section */}
        <motion.section 
          id="hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 sm:mb-20 space-y-8 sm:space-y-10"
        >
          {/* HAIDA Logo */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 mb-6 sm:mb-8"
          >
             <div className="absolute inset-0 rounded-2xl bg-blue-600/20 blur-3xl animate-pulse" />
             <div className="relative w-full h-full rounded-2xl p-1 bg-gradient-to-br from-blue-600/50 via-cyan-500/30 to-blue-500/50">
               <div className="w-full h-full rounded-xl overflow-hidden border-2 border-blue-600/40 bg-gradient-to-br from-blue-600 to-blue-500 relative z-10 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white tracking-tighter">H</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-700/60 via-transparent to-blue-400/20 opacity-80" />
                  {/* Tech grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30" />
               </div>
             </div>
             {/* Tech accents */}
             <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-600/30 rounded-full" />
             <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-cyan-500/30 rounded-full" />
          </motion.div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-600 text-[9px] font-mono tracking-[0.2em] uppercase mb-4 animate-fade-in">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>{t.system.online}</span>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.85] select-none">
              HAIDA<span className="text-blue-600/50">_</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto font-mono uppercase tracking-widest leading-relaxed whitespace-pre-line">
              {t.hero.subtitle}
            </p>
          </div>
          
          <div className="pt-6 sm:pt-8 flex justify-center w-full">
            <ActionDock />
          </div>
        </motion.section>

        {/* Platform Capabilities */}
        <section id="capabilities" className="mb-16 sm:mb-24">
          <div className="flex items-center justify-between mb-6 sm:mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-blue-600/10 text-blue-600">
                <Activity size={14} />
              </div>
              <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-muted-foreground">{t.sections.capabilities}</h2>
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent ml-6" />
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto">
            <LiveActionCard 
              title={t.cards.automation.title} 
              subtitle={t.cards.automation.subtitle}
              color="#2563EB" 
              animationType="nova"
              onClick={() => handleAction('automation')}
            />
            <LiveActionCard 
              title={t.cards.monitoring.title}
              subtitle={t.cards.monitoring.subtitle}
              color="#16A34A" 
              animationType="dashboard"
              onClick={() => handleAction('monitoring')}
            />
            <LiveActionCard 
              title={t.cards.reports.title}
              subtitle={t.cards.reports.subtitle}
              color="#F59E0B" 
              animationType="apps"
              onClick={() => handleAction('reports')}
            />
          </div>
        </section>

        {/* Command Surface - Organized by Categories */}
        <section id="command-surface" className="mb-16 sm:mb-20 space-y-12">
          {commandCategories.map((category, catIdx) => {
            const IconComponent = category.icon;
            const categoryKey = category.category as keyof typeof t.commands;
            const sectionKey = category.category as keyof typeof t.sections;
            
            return (
              <div key={category.category}>
                <div className="flex flex-row items-center justify-between mb-4 sm:mb-6 px-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded" style={{ backgroundColor: `${category.color}15`, color: category.color }}>
                      <IconComponent size={14} />
                    </div>
                    <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-muted-foreground">
                      {t.sections[sectionKey]}
                    </h2>
                  </div>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-border/30 to-transparent ml-6" />
                </div>

                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  className="grid grid-cols-5 gap-2.5 max-w-2xl mx-auto p-4 rounded-2xl glass-strong shadow-lg"
                >
                  {category.commands.map((cmd, idx) => {
                    const translationObj = t.commands[categoryKey] as Record<string, string>;
                    return (
                      <motion.div key={idx} variants={itemVariants}>
                        <CommandCard 
                          name={translationObj[cmd.key] || cmd.key}
                          command={cmd.command}
                          telegramLink={cmd.telegramLink}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            );
          })}
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-background/60 backdrop-blur-xl relative z-20 pb-28 pt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-6">
           <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-80 transition-opacity">
              <Bot size={20} className="text-foreground" />
              <div className="flex flex-col items-center">
                 <span className="text-[10px] font-bold tracking-[0.3em] text-foreground uppercase">{t.footer.company}</span>
                 <span className="text-[8px] font-mono text-muted-foreground">{t.system.established}</span>
              </div>
           </div>
           
           <div className="h-px w-12 bg-foreground/10" />

           <div className="flex flex-wrap justify-center gap-6 text-[9px] text-muted-foreground/50 uppercase tracking-widest font-medium">
             <a href="#" className="hover:text-foreground transition-colors">{t.footer.privacy}</a>
             <a href="#" className="hover:text-foreground transition-colors">{t.footer.legal}</a>
             <a href="#" className="hover:text-foreground transition-colors">{t.footer.status}</a>
           </div>

           <div className="text-[8px] text-foreground/20 font-mono tracking-widest text-center">
             {t.system.id}  •  {t.system.secure}
           </div>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
};

const App = () => (
  <SettingsProvider>
    <AppContent />
  </SettingsProvider>
);

export default App;