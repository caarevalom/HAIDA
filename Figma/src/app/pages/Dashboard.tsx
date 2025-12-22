"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Folder, FileText, Activity, Layers, AlertCircle, ArrowUpRight, GripVertical, X, Maximize2, MoveLeft, MoveRight, PieChart as PieIcon, BarChart3, Clock } from "lucide-react";
import { useData } from "../lib/data-context";
import { useLang } from "../lib/i18n-context";
import { useUi } from "../lib/ui-context";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { cn } from "../components/ui/utils";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

// Utility to calculate stats safely
const calculateStats = (data: ReturnType<typeof useData>) => {
  if (!data) return { activeProjects: 0, totalTestCases: 0, executionRate: 0, criticalDefects: 0, passed: 0, failed: 0, blocked: 0, skipped: 0 };

  const projects = Array.isArray(data.projects) ? data.projects : [];
  const suites = Array.isArray(data.suites) ? data.suites : [];
  const executions = Array.isArray(data.executions) ? data.executions : [];
  const defects = Array.isArray(data.defects) ? data.defects : [];

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const realTotalTestCases = suites.reduce((acc, s) => acc + (typeof s.case_count === 'number' ? s.case_count : 0), 0);

  let passed = 0, failed = 0, blocked = 0, skipped = 0;

  executions.forEach(exec => {
     if(exec.status === 'passed') passed++;
     else if(exec.status === 'failed') failed++;
     else if(exec.status === 'blocked') blocked++;
     else if(exec.status === 'skipped') skipped++;
  });

  const totalExecutions = passed + failed + blocked + skipped;
  const executionRate = realTotalTestCases > 0 ? Math.round((totalExecutions / realTotalTestCases) * 100) : 0;
  const criticalDefects = defects.filter(d => d.severity === 'critical').length;

  return { activeProjects, totalTestCases: realTotalTestCases, executionRate, criticalDefects, passed, failed, blocked, skipped };
};

// Error Boundary Component for robust data rendering
const SafeWidget = ({ children, hasData }: { children: React.ReactNode, hasData: boolean }) => {
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
        <AlertCircle className="h-8 w-8 mb-2 opacity-50 text-yellow-500" />
        <span className="text-xs">Data unavailable</span>
      </div>
    );
  }
  return <>{children}</>;
};

export function Dashboard() {
  const data = useData();
  const { t } = useLang();
  const { config } = useUi();
  const { dashboard } = config;
  const stats = calculateStats(data);
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedCard, setExpandedCard] = useState<any | null>(null);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);

  const pieData = [
    { name: t('status.passed'), value: stats.passed, color: '#22c55e' },
    { name: t('status.failed'), value: stats.failed, color: '#ef4444' },
    { name: t('status.blocked'), value: stats.blocked, color: '#eab308' },
    { name: t('status.skipped'), value: stats.skipped, color: '#94a3b8' },
  ];

  // Initial Card State
  const [cards, setCards] = useState([
    { id: 'kpi1', type: "kpi", title: t('kpi.projects'), value: stats.activeProjects, icon: "folder", sub: "Active Projects", trend: "+2 this month", trendUp: true },
    { id: 'kpi2', type: "kpi", title: t('kpi.coverage'), value: stats.totalTestCases, icon: "layers", sub: "Total Test Cases", trend: "+12% growth", trendUp: true },
    { id: 'kpi3', type: "kpi", title: t('kpi.execution'), value: `${stats.executionRate}%`, icon: "activity", sub: "Execution Rate", trend: "-5% vs avg", trendUp: false },
    { id: 'kpi4', type: "kpi", title: t('kpi.defects'), value: stats.criticalDefects, icon: "alert", sub: "Critical Defects", trend: "Stable", trendUp: true },
    { id: 'chart1', type: "chart-pie", title: "Status Distribution", data: pieData },
    { id: 'chart2', type: "chart-bar", title: "Suites per Project", data: (data.projects || []).slice(0, 4).map(p => ({ name: p.key, value: (data.suites || []).filter(s => s.project_id === p.id).length })) },
    { id: 'rec1', type: "recent", project: data.projects?.[0] || null },
    { id: 'rec2', type: "recent", project: data.projects?.[1] || null }
  ]);

  const removeWidget = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    toast.info("Widget removed");
  };

  const moveWidget = (index: number, direction: 'left' | 'right') => {
    const newCards = [...cards];
    if (direction === 'left' && index > 0) {
      [newCards[index], newCards[index - 1]] = [newCards[index - 1], newCards[index]];
    } else if (direction === 'right' && index < newCards.length - 1) {
      [newCards[index], newCards[index + 1]] = [newCards[index + 1], newCards[index]];
    }
    setCards(newCards);
  };

  const addWidget = (type: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    let newCard;
    
    switch(type) {
        case 'kpi':
            newCard = { id: newId, type: "kpi", title: "New Metric", value: 0, icon: "activity", sub: "Custom Metric", trend: "N/A", trendUp: true };
            break;
        case 'chart-bar':
            newCard = { id: newId, type: "chart-bar", title: "New Bar Chart", data: [{name: 'A', value: 10}, {name: 'B', value: 20}] };
            break;
        default:
            newCard = { id: newId, type: "recent", project: data.projects?.[0] };
    }
    
    setCards(prev => [...prev, newCard]);
    setIsAddWidgetOpen(false);
    toast.success("Widget Added");
  };

  const getIcon = (name: string) => {
    switch(name) {
      case 'folder': return <Folder className="h-6 w-6 text-blue-500" />;
      case 'layers': return <Layers className="h-6 w-6 text-indigo-500" />;
      case 'activity': return <Activity className="h-6 w-6 text-purple-500" />;
      case 'alert': return <AlertCircle className="h-6 w-6 text-red-500" />;
      default: return <Activity className="h-6 w-6" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
           <div className="flex items-center gap-2 mb-1">


           </div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            {dashboard.welcomeMessage}, Admin
          </h1>
          <p className="text-muted-foreground">
            {dashboard.subtitleMessage}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant={isEditMode ? "secondary" : "outline"} onClick={() => setIsEditMode(!isEditMode)}>
            {isEditMode ? "Done Editing" : "Customize Dashboard"}
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-blue-600 border-none">
            <Plus className="h-4 w-4" /> {t('btn.generate')}
          </Button>
        </div>
      </div>

      {/* Grid Layout - Smaller Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]">
        {cards.map((card: any, index: number) => (
          <Card 
            key={card.id} 
            className={cn(
              "relative overflow-hidden transition-all duration-300 border-muted/60 flex flex-col justify-between group",
              isEditMode ? "border-dashed border-primary/50 bg-primary/5" : "hover:shadow-lg hover:scale-[1.02] bg-card/80 backdrop-blur-sm"
            )}
            onClick={() => !isEditMode && setExpandedCard(card)}
          >
            {/* Edit Mode Overlays */}
            {isEditMode && (
              <div className="absolute inset-0 z-20 bg-black/5 dark:bg-white/5 flex flex-col items-center justify-center gap-2 opacity-100 backdrop-blur-[1px]">
                 <div className="flex gap-2">
                   <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); moveWidget(index, 'left'); }} disabled={index === 0}>
                     <MoveLeft className="h-4 w-4" />
                   </Button>
                   <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); removeWidget(card.id); }}>
                     <X className="h-4 w-4" />
                   </Button>
                   <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); moveWidget(index, 'right'); }} disabled={index === cards.length - 1}>
                     <MoveRight className="h-4 w-4" />
                   </Button>
                 </div>
                 <span className="text-xs font-semibold bg-background/80 px-2 py-1 rounded">Widget {index + 1}</span>
              </div>
            )}
            
            {!isEditMode && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Maximize2 className="h-4 w-4 text-muted-foreground/50" />
                </div>
            )}

            <SafeWidget hasData={true}>
                {/* KPI TYPE */}
                {card.type === 'kpi' && (
                <>
                    <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-muted/20 rounded-xl shadow-inner">
                        {getIcon(card.icon)}
                        </div>
                        {card.trend && (
                        <Badge variant="outline" className={cn("text-[10px] px-2 py-0 border-0", card.trendUp ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>
                            {card.trend}
                        </Badge>
                        )}
                    </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                    <div className="text-3xl font-bold tracking-tighter mb-1">{card.value ?? 0}</div>
                    <div className="font-semibold text-muted-foreground text-sm truncate">{card.title}</div>
                    <div className="text-[10px] text-muted-foreground/60 mt-1 truncate">{card.sub}</div>
                    </CardContent>
                </>
                )}

                {/* CHART PIE TYPE */}
                {card.type === 'chart-pie' && (
                <>
                    <CardHeader className="pb-0 pt-3 px-4">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 pb-2 relative">
                    {/* Fixed clipping by reducing outerRadius */}
                    <SafeWidget hasData={card.data && card.data.length > 0}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                            <Pie 
                                data={card.data} 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={30} 
                                outerRadius={45} // Reduced to prevent clipping in small card
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {card.data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </SafeWidget>
                    </CardContent>
                </>
                )}

                {/* CHART BAR TYPE */}
                {card.type === 'chart-bar' && (
                <>
                    <CardHeader className="pb-0 pt-3 px-4">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-2 pl-0">
                    <SafeWidget hasData={card.data && card.data.length > 0}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={card.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} />
                                <YAxis fontSize={9} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </SafeWidget>
                    </CardContent>
                </>
                )}

                {/* RECENT TYPE */}
                {card.type === 'recent' && (
                <>
                    <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex justify-between">
                        <div className="h-9 w-9 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Folder className="h-4 w-4" />
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-50" />
                    </div>
                    </CardHeader>
                    <SafeWidget hasData={!!card.project}>
                        <CardContent className="px-4 pb-4">
                            <div className="mb-2">
                            <div className="text-base font-bold line-clamp-1">{card.project?.name || "Untitled Project"}</div>
                            <div className="text-[10px] text-muted-foreground">Updated recently</div>
                            </div>
                            <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                                <span>Progress</span>
                                <span>75%</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 w-[75%]" />
                            </div>
                            </div>
                        </CardContent>
                    </SafeWidget>
                </>
                )}
            </SafeWidget>

          </Card>
        ))}
        
        {isEditMode && (
          <div 
            className="border-2 border-dashed border-muted rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/10 cursor-pointer transition-colors hover:border-primary/50 hover:text-primary"
            onClick={() => setIsAddWidgetOpen(true)}
          >
            <Plus className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-xs font-medium">Add Widget</span>
          </div>
        )}
      </div>

      {/* Expanded Card Modal */}
      <Dialog open={!!expandedCard} onOpenChange={(open) => !open && setExpandedCard(null)}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{expandedCard?.title || expandedCard?.project?.name || "Widget Details"}</DialogTitle>
                <DialogDescription>
                    Detailed view of the selected metric.
                </DialogDescription>
            </DialogHeader>
            <div className="h-[300px] w-full p-4 border rounded-md bg-muted/5 mt-2">
                {expandedCard?.type === 'chart-pie' && (
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie data={expandedCard.data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                            {expandedCard.data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                )}
                {expandedCard?.type === 'chart-bar' && (
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={expandedCard.data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
                 {expandedCard?.type === 'kpi' && (
                     <div className="flex flex-col items-center justify-center h-full gap-4">
                         <div className="p-4 bg-primary/10 rounded-full">
                            {getIcon(expandedCard.icon)}
                         </div>
                         <div className="text-6xl font-bold">{expandedCard.value}</div>
                         <div className="text-muted-foreground text-center">{expandedCard.sub}</div>
                     </div>
                )}
                 {expandedCard?.type === 'recent' && (
                     <div className="flex flex-col justify-center h-full gap-4">
                         <div className="text-xl font-bold">Project Overview</div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="p-3 bg-muted rounded-lg">
                                 <div className="text-xs text-muted-foreground">Status</div>
                                 <div className="font-semibold">{expandedCard.project?.status}</div>
                             </div>
                             <div className="p-3 bg-muted rounded-lg">
                                 <div className="text-xs text-muted-foreground">Key</div>
                                 <div className="font-semibold">{expandedCard.project?.key}</div>
                             </div>
                         </div>
                     </div>
                )}
            </div>
        </DialogContent>
      </Dialog>

      {/* Add Widget Modal */}
      <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Dashboard Widget</DialogTitle>
                <DialogDescription>Select a widget type to add to your dashboard.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary" onClick={() => addWidget('kpi')}>
                    <Activity className="h-6 w-6 text-primary" />
                    <span>KPI Card</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-500" onClick={() => addWidget('chart-bar')}>
                    <BarChart3 className="h-6 w-6 text-blue-500" />
                    <span>Bar Chart</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-green-50 hover:border-green-500" onClick={() => addWidget('chart-pie')}>
                    <PieIcon className="h-6 w-6 text-green-500" />
                    <span>Pie Chart</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-500" onClick={() => addWidget('recent')}>
                    <Clock className="h-6 w-6 text-orange-500" />
                    <span>Recent Project</span>
                </Button>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
