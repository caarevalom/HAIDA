"use client";

import { useState } from "react";
import { useData } from "../lib/data-context";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from "../components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "../components/ui/table";
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator 
} from "../components/ui/dropdown-menu";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { format, subDays, isAfter } from "date-fns";
import { 
  Download, Upload, Filter, Calendar, FileText, MoreHorizontal, Eye, Share2, Printer, ChevronDown 
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";

export function Reporter() {
  const { executions, projects, defects } = useData();
  const [filterQuery, setFilterQuery] = useState("");
  const [dateRange, setDateRange] = useState("30"); // days

  // --- Filtering Logic ---
  const filteredExecutions = executions.filter(exe => {
    // Date Filter
    const cutoffDate = subDays(new Date(), parseInt(dateRange));
    const isRecent = isAfter(new Date(exe.started_at), cutoffDate);
    
    // Text Filter (simulated search)
    const matchesText = filterQuery === "" || exe.id.toLowerCase().includes(filterQuery.toLowerCase());
    
    return isRecent && matchesText;
  });

  // --- Statistics ---
  const total = filteredExecutions.length;
  const passed = filteredExecutions.filter(e => e.status === 'passed').length;
  const failed = filteredExecutions.filter(e => e.status === 'failed').length;
  const blocked = filteredExecutions.filter(e => e.status === 'blocked').length;

  const pieData = [
    { name: 'Passed', value: passed, color: '#22c55e' },
    { name: 'Failed', value: failed, color: '#ef4444' },
    { name: 'Blocked', value: blocked, color: '#eab308' },
  ];

  // Defects by Project (Simulated Association)
  const defectsByProject = projects.map(p => {
     // Count defects vaguely associated via executions (mock logic)
     const projExecs = executions.filter(e => e.project_id === p.id);
     const defectCount = projExecs.filter(e => e.status === 'failed').length;
     return { name: p.name, defects: defectCount };
  });

  const handleExport = (format: string) => {
    toast.success("Report Exported", {
      description: `Generated ${format} report for ${total} executions.`
    });
  };

  const handleImport = () => {
    toast.info("Import Report", {
      description: "Opening file uploader... Supported formats: XML, JSON, HTML, PDF."
    });
    // Trigger simulated file input
  };

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500 max-w-7xl pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">Comprehensive insights into quality assurance metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" /> Import Data
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" /> Export Report <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExport("PDF")}>Adobe PDF (.pdf)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("Excel")}>Excel Spreadsheet (.xlsx)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("JSON")}>JSON Data (.json)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("HTML")}>HTML Archive (.html)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <StatsCard title="Total Executions" value={total} icon={<FileText className="h-4 w-4 text-blue-500" />} />
         <StatsCard title="Pass Rate" value={`${total > 0 ? Math.round((passed/total)*100) : 0}%`} icon={<CheckCircle className="h-4 w-4 text-green-500" />} />
         <StatsCard title="Defect Density" value={`${failed} Bugs`} icon={<Bug className="h-4 w-4 text-red-500" />} />
         <StatsCard title="Test Coverage" value="94%" icon={<Shield className="h-4 w-4 text-purple-500" />} />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        
        {/* Main Chart */}
        <Card className="md:col-span-4 shadow-sm border-border/60">
          <CardHeader>
            <CardTitle>Execution Trends</CardTitle>
            <CardDescription>Pass vs Fail distribution over selected period.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={pieData} layout="vertical" barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Secondary Chart */}
        <Card className="md:col-span-3 shadow-sm border-border/60">
          <CardHeader>
            <CardTitle>Defect Hotspots</CardTitle>
            <CardDescription>Projects requiring attention.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={defectsByProject}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="defects"
                >
                  {defectsByProject.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#eab308', '#3b82f6'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="shadow-sm border-border/60">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Detailed Execution Log</CardTitle>
            <CardDescription>Raw data from test runs.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
             <div className="relative">
               <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input 
                 placeholder="Filter by ID..." 
                 className="pl-9 w-[180px] bg-background" 
                 value={filterQuery}
                 onChange={(e) => setFilterQuery(e.target.value)}
               />
             </div>
             <div className="relative">
               <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <select 
                 className="h-10 pl-9 pr-8 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer hover:bg-muted/50 transition-colors"
                 value={dateRange}
                 onChange={(e) => setDateRange(e.target.value)}
               >
                 <option value="7">Last 7 Days</option>
                 <option value="30">Last 30 Days</option>
                 <option value="90">Last Quarter</option>
               </select>
               <ChevronDown className="absolute right-2.5 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Project / Suite</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="text-center">Defects</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutions.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                       No records found matching your filters.
                     </TableCell>
                  </TableRow>
                ) : (
                  filteredExecutions.map((exe) => {
                    const project = projects.find(p => p.id === exe.project_id);
                    const statusColor = 
                      exe.status === 'passed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' :
                      exe.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';

                    return (
                      <TableRow key={exe.id} className="group hover:bg-muted/50 transition-colors">
                        <TableCell className="font-mono text-xs font-medium">{exe.id}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{format(new Date(exe.started_at), 'MMM dd, HH:mm')}</TableCell>
                        <TableCell>
                           <div className="flex flex-col">
                             <span className="font-medium text-sm">{project?.name || 'Unknown Project'}</span>
                             <span className="text-[10px] text-muted-foreground font-mono">{exe.suite_id}</span>
                           </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`border ${statusColor} px-2 py-0.5 rounded-full`}>
                            {exe.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {(exe.duration_ms / 1000).toFixed(2)}s
                        </TableCell>
                        <TableCell className="text-center">
                          {exe.defect_id ? (
                             <Badge variant="destructive" className="text-[10px] cursor-pointer hover:bg-red-600 scale-90 hover:scale-100 transition-transform">
                               {exe.defect_id}
                             </Badge>
                          ) : (
                            <span className="text-muted-foreground/30">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                              <DropdownMenuItem><Share2 className="mr-2 h-4 w-4" /> Share Link</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600"><Download className="mr-2 h-4 w-4" /> Export PDF</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/10 border-t py-3">
          <p className="text-xs text-muted-foreground w-full text-center">
            Showing {filteredExecutions.length} of {executions.length} total executions
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6 flex items-center justify-between">
         <div>
           <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
           <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
         </div>
         <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
           {icon}
         </div>
      </CardContent>
    </Card>
  )
}

function CheckCircle(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}

function Bug(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="8" height="14" x="8" y="6" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="m5 19 3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/><path d="m10 4 1 2"/><path d="m14 4-1 2"/></svg>
}

function Shield(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
