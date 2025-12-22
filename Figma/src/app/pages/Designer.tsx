"use client";

import { useState, useMemo, useRef } from "react";
import { 
  Search, Plus, Folder, FileText, ChevronRight, MoreHorizontal, 
  Save, Play, Layers, Tag, CheckSquare, List, LayoutGrid, Upload, Sparkles, Settings, X, File, AlertCircle, CheckCircle2, Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { Label } from "../components/ui/label";
import { useData } from "../lib/data-context";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

// --- Tipos Locales para la UI ---
type ViewMode = "list" | "grid";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
}

export function Designer() {
  const { projects, suites, cases, updateTestCase } = useData();
  
  // Estado de Selección y UI
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects?.[0]?.id || "");
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isEditing, setIsEditing] = useState(false);

  // --- AI / Upload State ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA "FINDER" (Deep Search) ---
  const filteredData = useMemo(() => {
    if (!projects || projects.length === 0) return { suites: [], cases: [] };

    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return { suites: [], cases: [] };

    // Filter suites for this project
    const projectSuites = suites.filter(s => s.project_id === project.id);

    // Si no hay búsqueda, mostramos jerarquía normal
    if (!searchQuery.trim()) {
      const activeSuiteCases = selectedSuiteId 
        ? cases.filter(c => c.suite_id === selectedSuiteId)
        : [];
      return {
        suites: projectSuites,
        cases: activeSuiteCases
      };
    }

    // Búsqueda Profunda (Deep Search)
    const lowerQuery = searchQuery.toLowerCase();
    
    // Buscar casos que coincidan en Título, Descripción, o Contenido de Pasos
    const matchingCases: any[] = [];
    
    // Filter cases belonging to this project
    const projectCases = cases.filter(c => c.project_id === project.id);

    projectCases.forEach(testCase => {
      const titleMatch = testCase.title.toLowerCase().includes(lowerQuery);
      const descMatch = testCase.description?.toLowerCase().includes(lowerQuery);
      // Buscar DENTRO del "Documento" (Pasos)
      const stepMatch = testCase.steps?.some((step: any) => 
        step.action.toLowerCase().includes(lowerQuery) || 
        step.expected.toLowerCase().includes(lowerQuery)
      );

      if (titleMatch || descMatch || stepMatch) {
        const suite = projectSuites.find(s => s.id === testCase.suite_id);
        matchingCases.push({
          ...testCase,
          _suiteName: suite?.name // Meta-data para mostrar contexto
        });
      }
    });

    return {
      suites: projectSuites, // Mantenemos suites visibles
      cases: matchingCases,
      isSearchMode: true
    };

  }, [projects, suites, cases, selectedProjectId, selectedSuiteId, searchQuery]);

  const activeProject = projects?.find(p => p.id === selectedProjectId);
  const activeCase = useMemo(() => {
    if (!selectedCaseId) return null;
    return cases.find(c => c.id === selectedCaseId);
  }, [selectedCaseId, cases]);

  // Manejador de Guardado Simulado
  const handleSaveCase = () => {
    setIsEditing(false);
    toast.success("Test case saved successfully", {
      description: "All changes have been synced to the database."
    });
  };

  // --- File Upload Logic ---
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: UploadFile[] = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startUploadProcess = () => {
    if (files.length === 0) return;

    // Simulate upload for pending files
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
        if (files.some(f => f.status === 'success')) {
            startAnalysis();
        }
        return;
    }

    pendingFiles.forEach(file => {
      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'uploading' } : f));
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simulate random error for demonstration (e.g., if file name contains "error")
          const hasError = file.name.toLowerCase().includes("error");
          
          setFiles(prev => prev.map(f => f.id === file.id ? { 
            ...f, 
            status: hasError ? 'error' : 'success', 
            progress: 100,
            errorMessage: hasError ? "Invalid file format or corrupted data." : undefined
          } : f));

          // Check if all done
          // This is a simplified check inside the interval, effectively works per file
        } else {
           setFiles(prev => prev.map(f => f.id === file.id ? { ...f, progress } : f));
        }
      }, 300);
    });
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const successCount = files.filter(f => f.status === 'success').length;
      if (successCount > 0) {
          toast.success("Generation Complete", {
            description: `Generated test suites from ${successCount} documents.`
          });
          setIsUploadModalOpen(false);
          setFiles([]); // Reset
      } else {
          toast.error("Generation Failed", { description: "No valid documents to process." });
      }
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex h-full flex-col md:flex-row overflow-hidden bg-background/50 backdrop-blur-sm">
      
      {/* 1. SIDEBAR (Navegación de Proyecto/Suites) - Estilo Finder Sidebar */}
      <aside className="w-full md:w-64 border-r border-border/40 bg-muted/10 flex flex-col h-full glass">
        <div className="p-4 border-b border-border/40 space-y-3">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between font-semibold shadow-sm">
                <span className="truncate">{activeProject?.name || "Select Project"}</span>
                <ChevronRight className="h-4 w-4 rotate-90 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {projects?.map(p => (
                <DropdownMenuItem key={p.id} onClick={() => {
                  setSelectedProjectId(p.id);
                  setSelectedSuiteId(null);
                  setSelectedCaseId(null);
                }}>
                  <Folder className="mr-2 h-4 w-4 text-blue-500" />
                  {p.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg shadow-blue-500/20 transition-all"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" /> AI Generator
          </Button>
        </div>

        <ScrollArea className="flex-1 py-2">
          <div className="px-2 space-y-0.5">
            <Button
              variant={selectedSuiteId === null && !searchQuery ? "secondary" : "ghost"}
              className="w-full justify-start text-sm font-medium"
              onClick={() => { setSelectedSuiteId(null); setSearchQuery(""); }}
            >
              <Layers className="mr-2 h-4 w-4 text-primary" />
              All Suites
            </Button>
            
            <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-4 mb-1 flex justify-between items-center">
              <span>Test Suites</span>
              <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setIsSettingsModalOpen(true)}>
                <Settings className="h-3 w-3" />
              </Button>
            </div>
            
            {filteredData.suites.map(suite => {
              // Calculate real-time case count for suite
              const suiteCaseCount = cases.filter(c => c.suite_id === suite.id).length;
              
              return (
                <Button
                  key={suite.id}
                  variant={selectedSuiteId === suite.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm group transition-all",
                    selectedSuiteId === suite.id ? "bg-white dark:bg-slate-800 shadow-sm" : ""
                  )}
                  onClick={() => { 
                    setSelectedSuiteId(suite.id); 
                    setSearchQuery(""); // Limpiar búsqueda al navegar
                    setSelectedCaseId(null);
                  }}
                >
                  <Folder className={cn(
                    "mr-2 h-4 w-4 transition-colors",
                    selectedSuiteId === suite.id ? "text-blue-500 fill-blue-500/20" : "text-muted-foreground"
                  )} />
                  <span className="truncate">{suite.name}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {suiteCaseCount}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
        
        <div className="p-3 border-t border-border/40">
           <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-primary">
             <Plus className="mr-2 h-4 w-4" /> New Manual Suite
           </Button>
        </div>
      </aside>

      {/* 2. MIDDLE LIST (Lista de Casos con Búsqueda) - Estilo Finder List */}
      <section className="flex-1 md:max-w-md border-r border-border/40 flex flex-col bg-background/30 h-full">
        {/* Search Bar "Spotlight" Style */}
        <div className="p-3 border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <div className="relative group">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <Input 
              placeholder="Search inside cases..." 
              className="pl-9 bg-muted/30 border-transparent focus:bg-background focus:border-primary/20 transition-all rounded-xl shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="absolute right-2 top-2.5 text-[10px] text-muted-foreground bg-muted px-1.5 rounded">
                Deep Search
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
             <span className="text-xs text-muted-foreground font-medium">
               {filteredData.cases.length} Items {filteredData.isSearchMode ? "Found" : ""}
             </span>
             <div className="flex gap-1">
               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewMode("list")}>
                 <List className={cn("h-3.5 w-3.5", viewMode === "list" ? "text-primary" : "text-muted-foreground")} />
               </Button>
               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewMode("grid")}>
                 <LayoutGrid className={cn("h-3.5 w-3.5", viewMode === "grid" ? "text-primary" : "text-muted-foreground")} />
               </Button>
             </div>
          </div>
        </div>

        {/* Case List */}
        <ScrollArea className="flex-1">
          <div className={cn("p-3 gap-2", viewMode === "grid" ? "grid grid-cols-2" : "flex flex-col")}>
            <AnimatePresence>
            {filteredData.cases.map((testCase: any) => (
              <motion.div
                key={testCase.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  onClick={() => setSelectedCaseId(testCase.id)}
                  className={cn(
                    "cursor-pointer rounded-lg border transition-all duration-200 group relative overflow-hidden",
                    viewMode === "list" ? "p-3 flex flex-col gap-1" : "p-4 aspect-square flex flex-col justify-between",
                    selectedCaseId === testCase.id 
                      ? "bg-primary/5 border-primary/50 shadow-sm ring-1 ring-primary/20" 
                      : "bg-card hover:bg-muted/50 border-transparent hover:border-border/60"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                       <FileText className={cn("h-4 w-4", selectedCaseId === testCase.id ? "text-primary" : "text-muted-foreground")} />
                       <span className="font-semibold text-sm line-clamp-1">{testCase.title}</span>
                    </div>
                    {filteredData.isSearchMode && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1">{testCase._suiteName}</Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {testCase.description || "No description provided."}
                  </div>

                  {/* Highlights for search hits in steps */}
                  {filteredData.isSearchMode && searchQuery && (
                     <div className="mt-2 text-[10px] bg-yellow-500/10 text-yellow-600 p-1.5 rounded border border-yellow-500/20">
                        <span className="font-bold">Match found in content</span>
                     </div>
                  )}
                  
                  {viewMode === "list" && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] h-4">{testCase.id}</Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto">{testCase.priority}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
            
            {filteredData.cases.length === 0 && (
               <div className="text-center py-10 text-muted-foreground">
                 <Search className="h-10 w-10 mx-auto mb-2 opacity-20" />
                 <p className="text-sm">No test cases found</p>
                 {searchQuery && <p className="text-xs opacity-50">Try a different keyword</p>}
               </div>
            )}
          </div>
        </ScrollArea>
      </section>

      {/* 3. RIGHT PANE (Editor/Detail) - Document Style */}
      <main className="flex-[2] bg-background flex flex-col h-full overflow-hidden relative">
        {activeCase ? (
          <>
            {/* Toolbar */}
            <div className="h-14 border-b border-border/40 flex items-center justify-between px-6 bg-background/50 backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs text-foreground">{activeProject?.key}-{activeCase.id}</span>
                 <ChevronRight className="h-3 w-3" />
                 <span className="text-foreground font-medium truncate max-w-[200px]">{activeCase.title}</span>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Cancel" : "Edit"}
                 </Button>
                 {isEditing && (
                    <Button size="sm" onClick={handleSaveCase} className="gap-2">
                      <Save className="h-3.5 w-3.5" /> Save
                    </Button>
                 )}
                 <Separator orientation="vertical" className="h-6" />
                 <Button variant="outline" size="sm" className="gap-2">
                    <Play className="h-3.5 w-3.5" /> Run
                 </Button>
              </div>
            </div>

            {/* Content Editor */}
            <ScrollArea className="flex-1 p-8 max-w-4xl mx-auto w-full">
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Header Info */}
                <div className="space-y-4">
                  {isEditing ? (
                    <Input 
                      className="text-3xl font-bold border-none px-0 shadow-none focus-visible:ring-0 h-auto rounded-none border-b border-transparent focus:border-border transition-colors placeholder:text-muted-foreground/40" 
                      defaultValue={activeCase.title} 
                      placeholder="Test Case Title"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold tracking-tight">{activeCase.title}</h1>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-md px-2 py-1"><Tag className="h-3 w-3 mr-1" /> Functional</Badge>
                    <Badge variant="outline" className="rounded-md px-2 py-1"><AlertTriangle className="h-3 w-3 mr-1" /> {activeCase.priority}</Badge>
                    <Badge variant="secondary" className="rounded-md px-2 py-1 bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900">Automated</Badge>
                  </div>

                  {isEditing ? (
                    <Textarea 
                      className="resize-none border-muted bg-muted/20" 
                      placeholder="Description and preconditions..." 
                      defaultValue={activeCase.description} 
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {activeCase.description || "No description provided. Click edit to add details about preconditions, test data, or objectives."}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Steps "Table" */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary" /> Test Steps
                  </h3>
                  
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-[40px_1fr_1fr] bg-muted/50 border-b text-xs font-medium text-muted-foreground p-3">
                      <div className="text-center">#</div>
                      <div>Action</div>
                      <div>Expected Result</div>
                    </div>
                    
                    <div className="bg-card divide-y">
                      {activeCase.steps?.map((step: any, index: number) => (
                        <div key={index} className="grid grid-cols-[40px_1fr_1fr] p-3 text-sm hover:bg-muted/20 transition-colors group">
                           <div className="text-center text-muted-foreground font-mono pt-1">{index + 1}</div>
                           <div className="pr-4">
                             {isEditing ? (
                               <Input defaultValue={step.action} className="h-8" />
                             ) : (
                               <div dangerouslySetInnerHTML={{ 
                                 __html: searchQuery ? step.action.replace(new RegExp(searchQuery, 'gi'), (match: string) => `<mark class="bg-yellow-200 dark:bg-yellow-900 rounded-sm px-0.5">${match}</mark>`) : step.action 
                               }} />
                             )}
                           </div>
                           <div>
                              {isEditing ? (
                               <Input defaultValue={step.expected} className="h-8" />
                             ) : (
                               <div className="text-muted-foreground" dangerouslySetInnerHTML={{ 
                                 __html: searchQuery ? step.expected.replace(new RegExp(searchQuery, 'gi'), (match: string) => `<mark class="bg-yellow-200 dark:bg-yellow-900 rounded-sm px-0.5">${match}</mark>`) : step.expected 
                               }} />
                             )}
                           </div>
                        </div>
                      ))}
                      
                      {isEditing && (
                        <Button variant="ghost" className="w-full rounded-none h-10 text-muted-foreground hover:text-primary border-t border-dashed">
                           <Plus className="h-4 w-4 mr-2" /> Add Step
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 bg-muted/5">
             <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mb-6 animate-pulse">
               <FileText className="h-10 w-10" />
             </div>
             <h2 className="text-xl font-semibold mb-2">No Test Case Selected</h2>
             <p className="max-w-xs text-center text-sm">Select a file from the list or create a new one to start designing your test.</p>
          </div>
        )}
      </main>

      {/* AI Generator / Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Test Generator
            </DialogTitle>
            <DialogDescription>
              Select documents to analyze. The AI will parse content and generate ISTQB-compliant test cases.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Drop Zone */}
            <div 
              className={cn(
                "p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer bg-muted/10 relative",
                isAnalyzing && "opacity-50 pointer-events-none"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
               <input 
                 type="file" 
                 multiple 
                 className="hidden" 
                 ref={fileInputRef} 
                 onChange={handleFileSelect}
                 accept=".pdf,.docx,.txt,.md"
               />
               <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                 <Upload className="h-5 w-5 text-primary" />
               </div>
               <div className="text-center">
                 <p className="text-sm font-semibold text-foreground">Click to select files</p>
                 <p className="text-xs text-muted-foreground">or drag and drop here (PDF, DOCX, TXT)</p>
               </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-2 bg-card border rounded-lg group animate-in slide-in-from-top-2">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                      <File className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-sm font-medium truncate">{file.name}</span>
                         <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                      </div>
                      
                      {file.status !== 'pending' && file.status !== 'error' && (
                        <Progress value={file.progress} className="h-1.5" />
                      )}
                      
                      {file.status === 'error' && (
                        <span className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {file.errorMessage || "Upload failed"}
                        </span>
                      )}
                    </div>

                    <div className="shrink-0">
                      {file.status === 'pending' && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-100 hover:text-red-600" onClick={() => removeFile(file.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {file.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                      {file.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      {file.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Analyzing State */}
            {isAnalyzing && (
              <div className="flex items-center justify-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                 <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                 <span className="text-sm font-medium text-primary">AI is analyzing documents and generating suites...</span>
              </div>
            )}

          </div>

          <DialogFooter className="gap-2 sm:gap-0">
             <Button variant="outline" onClick={() => { setIsUploadModalOpen(false); setFiles([]); }}>
               Close
             </Button>
             <Button 
               disabled={files.length === 0 || isAnalyzing || files.every(f => f.status === 'success')} 
               onClick={startUploadProcess}
               className="min-w-[120px]"
             >
               {files.some(f => f.status === 'success') ? (isAnalyzing ? "Processing..." : "Retry Failed") : "Upload & Generate"}
             </Button>
             {files.some(f => f.status === 'success') && !isAnalyzing && (
               <Button onClick={startAnalysis} variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                 Complete
               </Button>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generation Settings</DialogTitle>
            <DialogDescription>Configure how AI generates your test artifacts.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label>Testing Standard</Label>
               <div className="flex gap-2">
                  <Badge className="cursor-pointer">ISTQB Foundation</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">ISO/IEC 29119</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">Agile</Badge>
               </div>
             </div>
             <div className="space-y-2">
               <Label>Output Format</Label>
               <div className="grid grid-cols-2 gap-2">
                  <div className="border rounded p-3 text-sm cursor-pointer hover:border-primary border-primary bg-primary/5">
                    <div className="font-bold">Gherkin (BDD)</div>
                    <div className="text-xs text-muted-foreground">Given/When/Then</div>
                  </div>
                  <div className="border rounded p-3 text-sm cursor-pointer hover:border-primary">
                    <div className="font-bold">Standard</div>
                    <div className="text-xs text-muted-foreground">Action/Expected</div>
                  </div>
               </div>
             </div>
             <div className="space-y-2">
               <Label>Coverage Depth</Label>
               <Input type="range" className="w-full" />
               <div className="flex justify-between text-xs text-muted-foreground">
                 <span>Low</span>
                 <span>Normal</span>
                 <span>Exhaustive</span>
               </div>
             </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsModalOpen(false)}>Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// Icono faltante
function AlertTriangle({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
