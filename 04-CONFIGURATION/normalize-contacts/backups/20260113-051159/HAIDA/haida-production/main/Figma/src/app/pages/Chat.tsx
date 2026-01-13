'use client';

import { useState } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Image as ImageIcon,
  Bot,
  MoreHorizontal,
  Layout,
  Settings,
  User,
  Plus,
  MessageSquare,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  time: string;
}

interface Thread {
  id: number;
  title: string;
  preview: string;
  time: string;
  active: boolean;
}

export function Chat() {
  const [activeThreadId, setActiveThreadId] = useState<number>(1);
  const [messageInput, setMessageInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const threads: Thread[] = [
    {
      id: 1,
      title: 'Script Generation Help',
      preview: 'Can you help me write a Cypress test?',
      time: '2m',
      active: true,
    },
    {
      id: 2,
      title: 'Project Config Error',
      preview: "I'm getting a 403 on the API endpoint...",
      time: '1h',
      active: false,
    },
    {
      id: 3,
      title: 'UI Components',
      preview: 'Generate a new card component with glass...',
      time: '1d',
      active: false,
    },
    {
      id: 4,
      title: 'Load Testing Plan',
      preview: 'How do I simulate 1000 users?',
      time: '2d',
      active: false,
    },
  ];

  const messages: Message[] = [
    {
      id: 1,
      role: 'system',
      content: 'Chat session started with Copilot Studio.',
      time: '10:29 AM',
    },
    {
      id: 2,
      role: 'user',
      content: 'Can you help me write a Cypress test for the login page?',
      time: '10:30 AM',
    },
    {
      id: 3,
      role: 'assistant',
      content:
        'Certainly! I can help you with that. Are you using any specific testing framework alongside Cypress?',
      time: '10:30 AM',
    },
    { id: 4, role: 'user', content: 'Just standard Cypress with TypeScript.', time: '10:31 AM' },
    {
      id: 5,
      role: 'assistant',
      content:
        "Here is a basic template for a Login test in Cypress + TypeScript:\n\n```typescript\ndescribe('Login Page', () => {\n  it('should log in successfully', () => {\n    cy.visit('/login');\n    cy.get('input[name=email]').type('hola@stayarta.com');\n    cy.get('input[name=password]').type('password123');\n    cy.get('button[type=submit]').click();\n    cy.url().should('include', '/dashboard');\n  });\n});\n```",
      time: '10:31 AM',
    },
  ];

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    toast.success('Message sent');
    setMessageInput('');
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

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden relative pb-16 md:pb-0">
      {/* LEFT SIDEBAR - Threads */}
      <div className="w-80 border-r border-border/40 flex-col bg-muted/5 hidden md:flex glass">
        {/* Header */}
        <div className="h-16 border-b border-border/40 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 font-semibold">
            <Bot className="h-5 w-5 text-primary" />
            <span>AI Copilot</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
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
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
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
                    {thread.title}
                  </h4>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {thread.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate opacity-80 group-hover:opacity-100">
                  {thread.preview}
                </p>
              </div>
            ))}
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
              <h2 className="font-semibold text-sm md:text-base">Script Generation Help</h2>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="h-4 text-[10px] px-1 bg-green-500/10 text-green-600 border-green-200 dark:border-green-900"
                >
                  GPT-4
                </Badge>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  Context: Active Project (ECM)
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
                <DropdownMenuItem> QA Specialist Agent</DropdownMenuItem>
                <DropdownMenuItem> Security Auditor Agent</DropdownMenuItem>
                <DropdownMenuItem> Frontend Architect Agent</DropdownMenuItem>
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
                        {msg.time}
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
                    disabled={!messageInput.trim()}
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
    </div>
  );
}
