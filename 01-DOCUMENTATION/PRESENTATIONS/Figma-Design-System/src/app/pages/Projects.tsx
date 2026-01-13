"use client";

import { useState } from "react";
import { Plus, MoreVertical, Calendar, Folder, UserPlus, CheckSquare, Clock, ArrowRight, X, Book, FileText, ChevronRight, Hash, Image, Link as LinkIcon, List as ListIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ScrollArea } from "../components/ui/scroll-area";
import { useData } from "../lib/data-context";
import { useLang } from "../lib/i18n-context";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";
import { Textarea } from "../components/ui/textarea";

// --- KANBAN TYPES ---
type TaskStatus = 'todo' | 'inprogress' | 'done';
interface Task {
  id: string;
  projectId: string;
  title: string;
  assignee?: string;
  dueDate?: string;
  status: TaskStatus;
}

// --- WIKI TYPES ---
interface WikiPage {
    id: string;
    projectId: string;
    title: string;
    content: string;
    parentId?: string | null; // For hierarchy
}

const MOCK_TASKS: Task[] = [
  { id: 't1', projectId: 'p1', title: 'Setup CI Pipeline', status: 'done', assignee: 'Carlos' },
  { id: 't2', projectId: 'p1', title: 'Write Auth Tests', status: 'inprogress', assignee: 'Ana' },
  { id: 't3', projectId: 'p1', title: 'Review PR #42', status: 'todo', assignee: 'Carlos' },
];

const MOCK_WIKI: WikiPage[] = [
    { id: 'w1', projectId: 'p1', title: 'Project Overview', content: '# Project Overview\n\nThis project aims to refactor the legacy monolithic application into microservices.\n\n## Goals\n- Improve scalability\n- Reduce technical debt\n- Enhance developer experience' },
    { id: 'w2', projectId: 'p1', title: 'Onboarding Guide', content: '# Developer Onboarding\n\nWelcome to the team! Here are the steps to set up your environment:\n\n1. Install Node.js v18+\n2. Clone the repo\n3. Run `npm install`' },
    { id: 'w3', projectId: 'p1', title: 'API Documentation', content: '# API Reference\n\nAll endpoints are prefixed with `/api/v1`.\n\nAuthentication is done via Bearer tokens.' },
];

export function Projects() {
  const { projects, addProject } = useData();
  const { t } = useLang();
  
  // -- KANBAN STATE --
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  
  // -- UI STATE --
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'board' | 'wiki'>('board');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeTaskStatus, setActiveTaskStatus] = useState<TaskStatus>('todo');

  // -- WIKI STATE --
  const [wikiPages, setWikiPages] = useState<WikiPage[]>(MOCK_WIKI);
  const [selectedWikiId, setSelectedWikiId] = useState<string | null>(null);
  const [isEditingWiki, setIsEditingWiki] = useState(false);
  const [wikiContent, setWikiContent] = useState("");

  // Filter Data
  const projectTasks = tasks.filter(t => !selectedProjectId || t.projectId === selectedProjectId);
  const projectWikiPages = wikiPages.filter(p => !selectedProjectId || p.projectId === selectedProjectId);

  // --- ACTIONS ---

  const handleCreateTask = () => {
    if (!newTaskTitle.trim() || !selectedProjectId) return;
    
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: selectedProjectId,
      title: newTaskTitle,
      status: activeTaskStatus,
      assignee: 'Unassigned'
    };
    
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle("");
    toast.success("Task created");
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleOpenTeam = (projectId: string) => {
    toast.info("Connecting to Team Channel...", {
      description: "Redirecting to Microsoft Teams / Slack...",
      action: {
        label: "Open",
        onClick: () => window.open("https://teams.microsoft.com", "_blank")
      }
    });
  };

  const handleSaveWiki = () => {
      if (!selectedWikiId) return;
      setWikiPages(prev => prev.map(p => p.id === selectedWikiId ? { ...p, content: wikiContent } : p));
      setIsEditingWiki(false);
      toast.success("Wiki saved");
  };

  const handleCreateWikiPage = () => {
      if (!selectedProjectId) return;
      const newPage: WikiPage = {
          id: Math.random().toString(36).substr(2, 9),
          projectId: selectedProjectId,
          title: "New Page",
          content: "# New Page\n\nStart writing..."
      };
      setWikiPages(prev => [...prev, newPage]);
      setSelectedWikiId(newPage.id);
      setWikiContent(newPage.content);
      setIsEditingWiki(true);
  };

  // --- RENDERERS ---

  const renderColumn = (status: TaskStatus, title: string, colorClass: string) => {
    const columnTasks = projectTasks.filter(t => t.status === status);
    
    return (
      <div className="flex-1 min-w-[300px] flex flex-col h-full bg-muted/20 rounded-xl border border-border/50 overflow-hidden">
        {/* Column Header */}
        <div className={cn("p-3 border-b flex items-center justify-between bg-muted/30", colorClass)}>
          <div className="flex items-center gap-2 font-semibold text-sm">
             <div className={cn("h-2 w-2 rounded-full", status === 'todo' ? "bg-slate-400" : status === 'inprogress' ? "bg-blue-500" : "bg-green-500")} />
             {title}
             <Badge variant="secondary" className="ml-2 text-[10px] h-5 px-1.5">{columnTasks.length}</Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setActiveTaskStatus(status); document.getElementById('new-task-input')?.focus(); }}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Tasks List */}
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3">
            {columnTasks.map(task => (
              <div 
                key={task.id} 
                className="group p-3 bg-card border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-2">
                   <p className="text-sm font-medium line-clamp-2">{task.title}</p>
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 -mr-1 -mt-1"><MoreVertical className="h-3 w-3" /></Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={() => moveTask(task.id, 'todo')}>Move to Todo</DropdownMenuItem>
                       <DropdownMenuItem onClick={() => moveTask(task.id, 'inprogress')}>Move to In Progress</DropdownMenuItem>
                       <DropdownMenuItem onClick={() => moveTask(task.id, 'done')}>Move to Done</DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5">
                     <Avatar className="h-5 w-5">
                       <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{task.assignee?.charAt(0)}</AvatarFallback>
                     </Avatar>
                     <span className="text-[10px] text-muted-foreground">{task.assignee}</span>
                  </div>
                  {task.status !== 'done' && (
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       className="h-6 w-6 rounded-full hover:bg-green-100 text-muted-foreground hover:text-green-600"
                       onClick={() => moveTask(task.id, status === 'todo' ? 'inprogress' : 'done')}
                     >
                       <ArrowRight className="h-3 w-3" />
                     </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Quick Add Placeholder */}
            {activeTaskStatus === status && (
               <div className="p-2 bg-background/50 border border-dashed rounded-lg animate-in fade-in">
                 <Input 
                   id="new-task-input"
                   placeholder="Type task title..." 
                   className="h-8 text-xs border-none shadow-none focus-visible:ring-0 px-1 bg-transparent"
                   value={newTaskTitle}
                   onChange={(e) => setNewTaskTitle(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                   autoFocus
                 />
                 <div className="flex justify-end mt-1">
                   <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={handleCreateTask}>Add</Button>
                 </div>
               </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderWiki = () => {
      const activePage = wikiPages.find(p => p.id === selectedWikiId) || projectWikiPages[0];

      return (
          <div className="flex flex-1 h-full border rounded-xl overflow-hidden bg-background">
              {/* Wiki Sidebar */}
              <div className="w-64 border-r bg-muted/10 flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                      <span className="font-semibold text-sm">Documentation</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCreateWikiPage}>
                          <Plus className="h-4 w-4" />
                      </Button>
                  </div>
                  <ScrollArea className="flex-1">
                      <div className="p-2 space-y-1">
                          {projectWikiPages.length === 0 && (
                              <p className="text-xs text-muted-foreground p-2 text-center">No pages yet.</p>
                          )}
                          {projectWikiPages.map(page => (
                              <Button
                                  key={page.id}
                                  variant={activePage?.id === page.id ? "secondary" : "ghost"}
                                  className="w-full justify-start text-sm h-9"
                                  onClick={() => {
                                      setSelectedWikiId(page.id);
                                      setWikiContent(page.content);
                                      setIsEditingWiki(false);
                                  }}
                              >
                                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span className="truncate">{page.title}</span>
                              </Button>
                          ))}
                      </div>
                  </ScrollArea>
              </div>

              {/* Wiki Content */}
              <div className="flex-1 flex flex-col min-w-0">
                  {activePage ? (
                      <>
                          <div className="h-12 border-b flex items-center justify-between px-6 bg-background/50">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Folder className="h-4 w-4" />
                                  <span>Wiki</span>
                                  <ChevronRight className="h-3 w-3" />
                                  <span className="text-foreground font-medium">{activePage.title}</span>
                              </div>
                              <Button 
                                  variant={isEditingWiki ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => {
                                      if(isEditingWiki) handleSaveWiki();
                                      else {
                                          setWikiContent(activePage.content);
                                          setIsEditingWiki(true);
                                      }
                                  }}
                              >
                                  {isEditingWiki ? "Save Changes" : "Edit Page"}
                              </Button>
                          </div>
                          
                          <div className="flex-1 overflow-auto p-8 max-w-4xl mx-auto w-full">
                              {isEditingWiki ? (
                                  <div className="space-y-4 h-full flex flex-col">
                                      <Input 
                                          value={activePage.title} 
                                          onChange={(e) => setWikiPages(prev => prev.map(p => p.id === activePage.id ? {...p, title: e.target.value} : p))}
                                          className="text-2xl font-bold border-none px-0 h-auto focus-visible:ring-0"
                                      />
                                      <div className="flex gap-2 border-b pb-2">
                                          <Button variant="ghost" size="sm"><Hash className="h-4 w-4" /></Button>
                                          <Button variant="ghost" size="sm"><ListIcon className="h-4 w-4" /></Button>
                                          <Button variant="ghost" size="sm"><LinkIcon className="h-4 w-4" /></Button>
                                          <Button variant="ghost" size="sm"><Image className="h-4 w-4" /></Button>
                                      </div>
                                      <Textarea 
                                          value={wikiContent}
                                          onChange={(e) => setWikiContent(e.target.value)}
                                          className="flex-1 resize-none font-mono text-sm bg-muted/20 border-none focus-visible:ring-0 p-4"
                                      />
                                  </div>
                              ) : (
                                  <div className="prose dark:prose-invert max-w-none">
                                      {/* Simple Mock Markdown Rendering */}
                                      {activePage.content.split('\n').map((line, i) => {
                                          if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mb-4">{line.replace('# ', '')}</h1>;
                                          if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-semibold mt-6 mb-3">{line.replace('## ', '')}</h2>;
                                          if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
                                          if (line.match(/^\d+\. /)) return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
                                          if (line === '') return <br key={i} />;
                                          return <p key={i} className="mb-2 leading-relaxed text-muted-foreground">{line}</p>;
                                      })}
                                  </div>
                              )}
                          </div>
                      </>
                  ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                          Select a page to view documentation.
                      </div>
                  )}
              </div>
          </div>
      );
  }

  const activeProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="container mx-auto p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Project Selection */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/40 pb-4 shrink-0">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <h1 className="text-3xl font-extrabold tracking-tight">Project Hub</h1>
             {activeProject && (
               <Badge variant="outline" className="text-lg font-normal px-3 py-1 bg-background/50 backdrop-blur-sm">
                 {activeProject.key}
               </Badge>
             )}
           </div>
           <p className="text-muted-foreground">Manage tasks, documentation, and team collaboration.</p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide">
           {/* Project Tabs */}
           {projects.map(p => (
             <Button
               key={p.id}
               variant={selectedProjectId === p.id ? "default" : "outline"}
               className={cn(
                 "whitespace-nowrap rounded-full transition-all",
                 selectedProjectId === p.id ? "shadow-md shadow-primary/20" : "opacity-70 hover:opacity-100"
               )}
               onClick={() => setSelectedProjectId(p.id)}
             >
               {p.name}
             </Button>
           ))}
           <Button variant="ghost" size="icon" className="rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground" onClick={() => setIsCreateOpen(true)}>
             <Plus className="h-4 w-4" />
           </Button>
        </div>
      </div>

      {/* Action Bar & View Switcher */}
      {selectedProjectId && (
        <div className="flex items-center justify-between shrink-0">
           <div className="flex bg-muted p-1 rounded-lg">
               <Button 
                   variant={activeTab === 'board' ? 'secondary' : 'ghost'} 
                   size="sm" 
                   className="h-7 text-xs"
                   onClick={() => setActiveTab('board')}
               >
                   <CheckSquare className="h-3.5 w-3.5 mr-2" /> Board
               </Button>
               <Button 
                   variant={activeTab === 'wiki' ? 'secondary' : 'ghost'} 
                   size="sm" 
                   className="h-7 text-xs"
                   onClick={() => setActiveTab('wiki')}
               >
                   <Book className="h-3.5 w-3.5 mr-2" /> Wiki / Docs
               </Button>
           </div>
           
           <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-2 mr-2">
                    <Avatar className="border-2 border-background w-8 h-8">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                        +3
                    </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-2" onClick={() => handleOpenTeam(selectedProjectId!)}>
                    <UserPlus className="h-3.5 w-3.5" /> Team
                </Button>
                {activeTab === 'board' && (
                    <Button size="sm" className="h-8 text-xs gap-2" onClick={() => { setActiveTaskStatus('todo'); setTimeout(() => document.getElementById('new-task-input')?.focus(), 100); }}>
                        <Plus className="h-3.5 w-3.5" /> New Task
                    </Button>
                )}
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'board' ? (
            <div className="flex gap-4 h-full overflow-x-auto pb-2">
              <div className="flex gap-4 min-w-[1000px] md:min-w-0 w-full h-full">
                {renderColumn('todo', 'To Do', 'border-l-4 border-l-slate-400')}
                {renderColumn('inprogress', 'In Progress', 'border-l-4 border-l-blue-500')}
                {renderColumn('done', 'Done', 'border-l-4 border-l-green-500')}
              </div>
            </div>
        ) : (
            renderWiki()
        )}
      </div>

      {/* Create Project Dialog (Reused Logic) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Start a new project workspace.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
               <Label>Project Name</Label>
               <Input placeholder="e.g. Website Revamp" />
             </div>
          </div>
          <DialogFooter>
             <Button onClick={() => setIsCreateOpen(false)}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
