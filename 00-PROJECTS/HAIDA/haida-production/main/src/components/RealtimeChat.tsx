import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, Users, Wifi, WifiOff } from 'lucide-react'
import { useRealtime, REALTIME_EVENTS } from '@/hooks/useRealtime'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  content: string
  user_id: string
  user_name?: string
  created_at: string
  message_type: 'text' | 'system'
}

interface RealtimeChatProps {
  projectId: string
  currentUserId: string
  currentUserName: string
  className?: string
}

export const RealtimeChat: React.FC<RealtimeChatProps> = ({
  projectId,
  currentUserId,
  currentUserName,
  className
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle realtime messages
  const handleRealtimeMessage = (event: string, payload: any) => {
    switch (event) {
      case REALTIME_EVENTS.MESSAGE_CREATED:
        // Add new message to list
        setMessages(prev => [...prev, {
          id: payload.message_id,
          content: payload.content,
          user_id: payload.user_id,
          user_name: payload.user_name || 'Unknown User',
          created_at: new Date().toISOString(),
          message_type: 'text'
        }])
        break

      case REALTIME_EVENTS.USER_JOINED:
        setOnlineUsers(prev => new Set([...prev, payload.user_id]))
        // Add system message
        setMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          content: `${payload.user_name || 'A user'} joined the chat`,
          user_id: 'system',
          user_name: 'System',
          created_at: new Date().toISOString(),
          message_type: 'system'
        }])
        break

      case REALTIME_EVENTS.USER_LEFT:
        setOnlineUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(payload.user_id)
          return newSet
        })
        // Add system message
        setMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          content: `${payload.user_name || 'A user'} left the chat`,
          user_id: 'system',
          user_name: 'System',
          created_at: new Date().toISOString(),
          message_type: 'system'
        }])
        break
    }
  }

  const { isConnected, sendMessage } = useRealtime({
    projectId,
    onMessage: handleRealtimeMessage,
    enabled: !!projectId
  })

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true })
          .limit(50)

        if (error) throw error

        setMessages(data.map(msg => ({
          id: msg.id,
          content: msg.content,
          user_id: msg.user_id,
          user_name: msg.user_name || 'Unknown User',
          created_at: msg.created_at,
          message_type: msg.message_type || 'text'
        })))
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    if (projectId) {
      loadMessages()
    }
  }, [projectId])

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !isConnected) return

    try {
      // Insert message into database (this will trigger the broadcast)
      const { error } = await supabase
        .from('messages')
        .insert({
          project_id: projectId,
          user_id: currentUserId,
          content: newMessage.trim(),
          message_type: 'text'
        })

      if (error) throw error

      setNewMessage('')
      inputRef.current?.focus()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Create user session when component mounts
  useEffect(() => {
    const createUserSession = async () => {
      try {
        await supabase.from('user_sessions').upsert({
          user_id: currentUserId,
          project_id: projectId,
          session_type: 'collaboration',
          is_active: true,
          current_context: { page: 'chat' }
        })
      } catch (error) {
        console.error('Error creating user session:', error)
      }
    }

    if (projectId && currentUserId) {
      createUserSession()
    }

    // Cleanup session on unmount
    return () => {
      supabase.from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', currentUserId)
        .eq('project_id', projectId)
    }
  }, [projectId, currentUserId])

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Chat
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {onlineUsers.size} online
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages Area */}
        <ScrollArea className="h-96 px-4">
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.user_id === currentUserId ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {message.user_name?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex flex-col gap-1 max-w-[70%] ${
                  message.user_id === currentUserId ? 'items-end' : ''
                }`}>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{message.user_name}</span>
                    <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                  </div>

                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
                      message.message_type === 'system'
                        ? 'bg-muted text-muted-foreground italic'
                        : message.user_id === currentUserId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected}
              className="flex-1"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newMessage.trim() || !isConnected}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
