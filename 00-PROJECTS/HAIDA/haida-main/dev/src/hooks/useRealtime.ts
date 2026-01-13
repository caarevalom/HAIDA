import { useEffect, useRef, useState, useCallback } from 'react'
import { RealtimeChannel, RealtimeChannelSendResponse } from '@supabase/supabase-js'
import {
  supabase,
  createProjectChannel,
  setRealtimeAuth,
  REALTIME_EVENTS,
  RealtimeEvent,
  handleRealtimeError,
  setupReconnectionHandler
} from '@/lib/supabase'

interface UseRealtimeOptions {
  projectId?: string
  userId?: string
  onMessage?: (event: RealtimeEvent, payload: any) => void
  onError?: (error: any) => void
  enabled?: boolean
}

interface UseRealtimeReturn {
  channel: RealtimeChannel | null
  isConnected: boolean
  connectionState: string
  sendMessage: (event: string, payload: any) => Promise<RealtimeChannelSendResponse>
  subscribe: () => Promise<void>
  unsubscribe: () => void
}

export const useRealtime = ({
  projectId,
  userId,
  onMessage,
  onError,
  enabled = true
}: UseRealtimeOptions): UseRealtimeReturn => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState('disconnected')
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Create channel based on project or user
  const createChannel = useCallback(() => {
    if (projectId) {
      return createProjectChannel(projectId)
    }
    if (userId) {
      return supabase.channel(`user:${userId}:notifications`, {
        config: { broadcast: { self: true, ack: true }, private: true }
      })
    }
    return null
  }, [projectId, userId])

  // Send message to channel
  const sendMessage = useCallback(async (event: string, payload: any) => {
    if (!channelRef.current) {
      throw new Error('Channel not initialized')
    }
    return channelRef.current.send({
      type: 'broadcast',
      event,
      payload
    })
  }, [])

  // Subscribe to channel
  const subscribe = useCallback(async () => {
    if (!enabled || channelRef.current) return

    try {
      // Set auth for private channels
      await setRealtimeAuth()

      const channel = createChannel()
      if (!channel) return

      channelRef.current = channel

      // Set up event listeners
      Object.values(REALTIME_EVENTS).forEach(event => {
        channel.on('broadcast', { event }, (payload) => {
          if (onMessage) {
            onMessage(event as RealtimeEvent, payload)
          }
        })
      })

      // Connection state monitoring
      channel.subscribe(async (status) => {
        setConnectionState(status)

        switch (status) {
          case 'SUBSCRIBED':
            setIsConnected(true)
            console.log('Realtime connected')
            break
          case 'CHANNEL_ERROR':
            setIsConnected(false)
            handleRealtimeError(new Error('Channel error'), 'useRealtime')
            if (onError) onError(new Error('Channel error'))
            // Auto-reconnect after delay
            reconnectTimeoutRef.current = setTimeout(() => {
              unsubscribe()
              subscribe()
            }, 5000)
            break
          case 'TIMED_OUT':
            setIsConnected(false)
            console.warn('Realtime connection timed out')
            break
          case 'CLOSED':
            setIsConnected(false)
            console.log('Realtime connection closed')
            break
        }
      })

      // Set up reconnection handler
      setupReconnectionHandler(channel, () => {
        console.log('Attempting to reconnect...')
        subscribe()
      })

    } catch (error) {
      handleRealtimeError(error, 'useRealtime subscribe')
      if (onError) onError(error)
    }
  }, [enabled, createChannel, onMessage, onError])

  // Unsubscribe from channel
  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
      setIsConnected(false)
      setConnectionState('disconnected')
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
  }, [])

  // Auto-subscribe on mount if enabled
  useEffect(() => {
    if (enabled) {
      subscribe()
    }

    return () => {
      unsubscribe()
    }
  }, [enabled, subscribe, unsubscribe])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    channel: channelRef.current,
    isConnected,
    connectionState,
    sendMessage,
    subscribe,
    unsubscribe
  }
}

// Hook for collaborative specification editing
export const useSpecificationRealtime = (projectId: string, specificationId?: string) => {
  const [collaborators, setCollaborators] = useState<Set<string>>(new Set())
  const [isLocked, setIsLocked] = useState(false)
  const [lockedBy, setLockedBy] = useState<string | null>(null)

  const handleRealtimeMessage = useCallback((event: RealtimeEvent, payload: any) => {
    switch (event) {
      case REALTIME_EVENTS.SPECIFICATION_UPDATED:
        if (payload.specification_id === specificationId) {
          // Handle specification changes
          if (payload.changes?.locked_changed) {
            setIsLocked(payload.is_locked)
            setLockedBy(payload.locked_by)
          }
        }
        break
      case REALTIME_EVENTS.USER_JOINED:
        setCollaborators(prev => new Set([...prev, payload.user_id]))
        break
      case REALTIME_EVENTS.USER_LEFT:
        setCollaborators(prev => {
          const newSet = new Set(prev)
          newSet.delete(payload.user_id)
          return newSet
        })
        break
    }
  }, [specificationId])

  const realtime = useRealtime({
    projectId,
    onMessage: handleRealtimeMessage,
    enabled: !!projectId
  })

  return {
    ...realtime,
    collaborators: Array.from(collaborators),
    isLocked,
    lockedBy
  }
}

// Hook for realtime notifications
export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<any[]>([])

  const handleRealtimeMessage = useCallback((event: RealtimeEvent, payload: any) => {
    if (event === REALTIME_EVENTS.MESSAGE_CREATED || event.includes('execution')) {
      // Add new notification
      setNotifications(prev => [payload, ...prev])
    }
  }, [])

  const realtime = useRealtime({
    userId,
    onMessage: handleRealtimeMessage,
    enabled: !!userId
  })

  return {
    ...realtime,
    notifications
  }
}

// Hook for test execution progress
export const useTestExecutionRealtime = (projectId: string) => {
  const [executions, setExecutions] = useState<Map<string, any>>(new Map())

  const handleRealtimeMessage = useCallback((event: RealtimeEvent, payload: any) => {
    if (event.includes('execution')) {
      setExecutions(prev => new Map(prev.set(payload.execution_id, payload)))
    }
  }, [])

  const realtime = useRealtime({
    projectId,
    onMessage: handleRealtimeMessage,
    enabled: !!projectId
  })

  return {
    ...realtime,
    executions: Array.from(executions.values())
  }
}
