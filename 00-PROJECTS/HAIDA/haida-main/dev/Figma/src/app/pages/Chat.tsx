'use client';

import { useState, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Image as ImageIcon,
  Bot,
  MoreHorizontal,
  Layout,
  Settings,
  Plus,
  Search,
  Sparkles,
  Smile,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../lib/auth-context';
import {
  chatApi,
  m365Api,
  ChatThread,
  ChatMessage,
  ChatProviderSummary,
  M365App,
} from '../lib/apiService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';

export function Chat() {
  const { isAuthenticated } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [apps, setApps] = useState<M365App[]>([]);
  const [profileName, setProfileName] = useState<string>('');
  const [providers, setProviders] = useState<ChatProviderSummary[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>('copilot-studio');
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [directLineEndpoint, setDirectLineEndpoint] = useState('');
  const [directLineSecret, setDirectLineSecret] = useState('');

  const loadThreads = async () => {
    try {
      const data = await chatApi.listThreads();
      setThreads(data);
      if (!data.length) {
        const created = await chatApi.createThread('New Conversation', activeProvider);
        setThreads([created]);
        setActiveThreadId(created.id);
        const initialMessages = await chatApi.listMessages(created.id);
        setMessages(initialMessages);
        return;
      }
      if (!activeThreadId) {
        setActiveThreadId(data[0].id);
        const initialMessages = await chatApi.listMessages(data[0].id);
        setMessages(initialMessages);
      }
    } catch (err: any) {
      toast.error('Failed to load threads', {
        description: err?.detail || err?.message || 'Please try again.',
      });
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const data = await chatApi.listMessages(threadId);
      setMessages(data);
    } catch (err: any) {
      toast.error('Failed to load messages', {
        description: err?.detail || err?.message || 'Please try again.',
      });
    }
  };

  const loadApps = async () => {
    try {
      const data = await m365Api.listApps();
      setApps(data.apps || []);
      setProfileName(data.profile?.displayName || data.profile?.mail || '');
    } catch (err: any) {
      setApps([]);
      toast.error('Microsoft apps unavailable', {
        description: err?.detail || err?.message || 'Please sign in again.',
      });
    }
  };

  const loadProviders = async () => {
    try {
      const data = await chatApi.listProviders();
      setProviders(data);
      const copilot = data.find((item) => item.provider === 'copilot-studio');
      const local = data.find((item) => item.provider === 'lmstudio');
      if (copilot?.config?.direct_line_endpoint) {
        setDirectLineEndpoint(copilot.config.direct_line_endpoint);
      }
      if (!copilot?.has_direct_line_secret && local?.has_local_model) {
        setActiveProvider('lmstudio');
      }
    } catch (err: any) {
      toast.error('Failed to load agent settings', {
        description: err?.detail || err?.message || 'Please try again.',
      });
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadThreads();
    loadApps();
    loadProviders();
  }, [isAuthenticated]);

  const handleSendMessage = async () => {
    const content = messageInput.trim();
    if (!content) return;
    if (!isAuthenticated) {
      toast.error('Sign in required', {
        description: 'Please sign in with Microsoft to use Copilot.',
      });
      return;
    }
    setMessageInput('');

    try {
      let threadId = activeThreadId;
      if (!threadId) {
        const created = await chatApi.createThread('New Conversation', activeProvider);
        setThreads((prev) => [created, ...prev]);
        threadId = created.id;
        setActiveThreadId(created.id);
      }

      await chatApi.sendMessage(threadId, content, activeProvider);
      await loadMessages(threadId);
      await loadThreads();
    } catch (err: any) {
      toast.error('Message failed', {
        description: err?.detail || err?.message || 'Unable to send message.',
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      toast.success('Recording processed');
      setMessageInput((prev) => prev + ' [Voice Input Processed]');
    } else {
      toast.info('Listening...');
    }
    setIsRecording(!isRecording);
  };

  const handleSelectThread = async (threadId: string) => {
    setActiveThreadId(threadId);
    await loadMessages(threadId);
  };

  const handleSaveAgentConfig = async () => {
    try {
      await chatApi.updateProvider('copilot-studio', {
        direct_line_secret: directLineSecret || undefined,
        direct_line_endpoint: directLineEndpoint || undefined,
      });
      setDirectLineSecret('');
      setAgentDialogOpen(false);
      await loadProviders();
      toast.success('Agent settings updated');
    } catch (err: any) {
      toast.error('Agent settings failed', {
        description: err?.detail || err?.message || 'Unable to update.',
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden relative pb-16 md:pb-0">
      {/* LEFT SIDEBAR - Threads */}
      <div className="w-80 border-r border-border/40 flex-col bg-muted/5 hidden md:flex glass">
        {/* Header */}
        <div className="h-16 border-b border-border/40 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 font-semibold">
            <Bot className="h-5 w-5 text-primary" />
            <span>
              {activeProvider === 'lmstudio' ? 'LM Studio (Local)' : 'Copilot Studio'}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                Cambiar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Proveedor</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {providers
                .filter((item) => {
                  if (item.provider === 'copilot-studio') return true;
                  if (item.provider === 'lmstudio') return item.has_local_model;
                  return false;
                })
                .map((item) => (
                  <DropdownMenuItem
                    key={item.provider}
                    onClick={() => setActiveProvider(item.provider)}
                  >
                    {item.provider === 'lmstudio' ? 'LM Studio (Local)' : 'Copilot Studio'}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={async () => {
              try {
                const created = await chatApi.createThread('New Conversation');
                setThreads((prev) => [created, ...prev]);
                setActiveThreadId(created.id);
                setMessages([]);
              } catch (err: any) {
                toast.error('Unable to create thread', {
                  description: err?.detail || err?.message || 'Please try again.',
                });
              }
            }}
            disabled={!isAuthenticated}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-9 bg-background/50 border-transparent shadow-sm focus:bg-background"
            />
          </div>
        </div>

        {/* Thread List */}
        <ScrollArea className="flex-1 px-2 py-2">
          <div className="space-y-1">
            {threads.map((thread) => {
              const threadTime = thread.updated_at || thread.created_at;
              const preview =
                thread.message_count > 0 ? `${thread.message_count} messages` : 'No messages yet';
              return (
                <div
                  key={thread.id}
                  onClick={() => handleSelectThread(thread.id)}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer transition-all group border border-transparent',
                    activeThreadId === thread.id
                      ? 'bg-primary/10 border-primary/20 shadow-sm'
                      : 'hover:bg-muted/50 hover:border-border/50'
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4
                      className={cn(
                        'text-sm font-medium truncate pr-2',
                        activeThreadId === thread.id ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {thread.title || 'Conversation'}
                    </h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {threadTime
                        ? formatDistanceToNow(new Date(threadTime), { addSuffix: true })
                        : ''}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate opacity-80 group-hover:opacity-100">
                    {preview}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* User Footer */}
        <div className="p-4 border-t border-border/40 bg-muted/10">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CR</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Carlos Ruiz</p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* CENTER - Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/30 backdrop-blur-sm relative">
        {/* Chat Header */}
        <div className="h-16 border-b border-border/40 flex items-center justify-between px-6 bg-background/60 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm md:text-base">
                {threads.find((thread) => thread.id === activeThreadId)?.title || 'New Conversation'}
              </h2>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="h-4 text-[10px] px-1 bg-green-500/10 text-green-600 border-green-200 dark:border-green-900"
                >
                  Copilot Studio
                </Badge>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  {profileName ? `Signed in as ${profileName}` : 'Microsoft session'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                  <span>Agents</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Agents</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setAgentDialogOpen(true)}>
                  Configure Copilot Studio
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon">
              <Layout className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-4 animate-in fade-in slide-in-from-bottom-2',
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                {/* Avatar */}
                {msg.role !== 'system' && (
                  <div className="shrink-0 mt-1">
                    {msg.role === 'assistant' ? (
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-md">
                        <Bot className="h-5 w-5" />
                      </div>
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                {msg.role === 'system' ? (
                  <div className="w-full flex justify-center my-4">
                    <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50 shadow-sm">
                      {msg.content}
                    </span>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'flex flex-col gap-1 max-w-[85%] md:max-w-[75%]',
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    )}
                  >
                    <div className="flex items-end gap-2">
                      <span className="text-[10px] text-muted-foreground opacity-50 mb-1">
                        {msg.role === 'assistant' ? 'Copilot' : 'You'}
                      </span>
                      <span className="text-[10px] text-muted-foreground opacity-50 mb-1">
                        {msg.created_at
                          ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })
                          : ''}
                      </span>
                    </div>
                    <div
                      className={cn(
                        'p-3.5 md:p-4 rounded-2xl text-sm shadow-sm leading-relaxed whitespace-pre-wrap',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-white dark:bg-slate-800 border border-border/50 rounded-tl-sm'
                      )}
                    >
                      {msg.content}
                    </div>
                    {/* Feedback Buttons for Assistant */}
                    {msg.role === 'assistant' && (
                      <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Could add copy/like buttons here */}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-background border-t border-border/40">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative flex flex-col gap-2 p-2 rounded-xl border border-border shadow-sm bg-muted/10 focus-within:bg-background focus-within:ring-1 focus-within:ring-primary/30 transition-all duration-300">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Message Copilot..."
                className="w-full bg-transparent border-none resize-none focus:outline-none min-h-[44px] max-h-32 px-2 py-2 text-sm"
                rows={1}
              />

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 transition-colors',
                      isRecording
                        ? 'text-red-500 bg-red-50 hover:bg-red-100'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={toggleRecording}
                  >
                    <Mic className={cn('h-4 w-4', isRecording && 'animate-pulse')} />
                  </Button>
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !isAuthenticated}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-2 opacity-70">
              Copilot can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - M365 & Agents */}
      <div className="w-80 border-l border-border/40 hidden lg:flex flex-col bg-muted/5 glass">
        <div className="p-4 border-b border-border/40">
          <h3 className="text-sm font-semibold">Microsoft 365</h3>
          <p className="text-xs text-muted-foreground">
            {profileName ? `Signed in as ${profileName}` : 'Connect to see your apps'}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {apps.length === 0 && (
            <div className="text-xs text-muted-foreground">
              No apps available. Please sign in with Microsoft.
            </div>
          )}
          {apps.map((app) => (
            <div
              key={app.name}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/70 px-3 py-2"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{app.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {app.status === 'available' ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(app.url, '_blank')}
                disabled={app.status !== 'available'}
              >
                Open
              </Button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border/40 space-y-3">
          <div>
            <h4 className="text-sm font-semibold">Agent Settings</h4>
            <p className="text-xs text-muted-foreground">Copilot Studio Direct Line</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/70 px-3 py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">copilot-studio</p>
                <p className="text-[10px] text-muted-foreground">
                  {providers.find((item) => item.provider === 'copilot-studio')?.has_direct_line_secret
                    ? 'Configured'
                    : 'Not configured'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setAgentDialogOpen(true)}>
                Configure
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/70 px-3 py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">lmstudio (local)</p>
                <p className="text-[10px] text-muted-foreground">
                  {providers.find((item) => item.provider === 'lmstudio')?.has_local_model
                    ? 'Configured'
                    : 'Not configured'}
                </p>
              </div>
              <Badge variant="outline">
                {providers.find((item) => item.provider === 'lmstudio')?.config?.local_model || 'No model'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={agentDialogOpen} onOpenChange={setAgentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copilot Studio Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="direct-line-endpoint">Direct Line Endpoint</Label>
              <Input
                id="direct-line-endpoint"
                value={directLineEndpoint}
                onChange={(e) => setDirectLineEndpoint(e.target.value)}
                placeholder="https://directline.botframework.com/v3/directline"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direct-line-secret">Direct Line Secret</Label>
              <Input
                id="direct-line-secret"
                type="password"
                value={directLineSecret}
                onChange={(e) => setDirectLineSecret(e.target.value)}
                placeholder="Paste Copilot Studio Direct Line secret"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAgentConfig}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
