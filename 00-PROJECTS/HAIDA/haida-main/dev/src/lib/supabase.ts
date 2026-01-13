import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

type SupabaseInstance = SupabaseClient

const globalForSupabase = globalThis as typeof globalThis & {
  __haidaSupabase?: SupabaseInstance
}

const createSupabaseInstance = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

// Create a single Supabase client per browser context to avoid GoTrue warnings.
export const supabase = globalForSupabase.__haidaSupabase ?? createSupabaseInstance()

if (!globalForSupabase.__haidaSupabase) {
  globalForSupabase.__haidaSupabase = supabase
}

// Realtime channel configurations following best practices
export const createProjectChannel = (projectId: string) => {
  return supabase.channel(`project:${projectId}`, {
    config: {
      broadcast: { self: true, ack: true },
      presence: { key: `user-${Date.now()}` },
      private: true, // Use private channels for security
    },
  })
}

export const createUserChannel = (userId: string) => {
  return supabase.channel(`user:${userId}:notifications`, {
    config: {
      broadcast: { self: true, ack: true },
      private: true,
    },
  })
}

// Helper function to set auth for realtime
export const setRealtimeAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  await supabase.realtime.setAuth(session?.access_token || '')
}

// Realtime event types following naming conventions
export const REALTIME_EVENTS = {
  // Specification events
  SPECIFICATION_CREATED: 'specification_created',
  SPECIFICATION_UPDATED: 'specification_updated',
  SPECIFICATION_DELETED: 'specification_deleted',

  // Message events
  MESSAGE_CREATED: 'message_created',

  // Test execution events
  EXECUTION_STARTED: 'execution_started',
  EXECUTION_COMPLETED: 'execution_completed',
  EXECUTION_FAILED: 'execution_failed',
  EXECUTION_STATUS_CHANGED: 'execution_status_changed',

  // User presence events
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  USER_REJOINED: 'user_rejoined',
} as const

export type RealtimeEvent = typeof REALTIME_EVENTS[keyof typeof REALTIME_EVENTS]

// Error handling for realtime connections
export const handleRealtimeError = (error: any, context: string) => {
  console.error(`Realtime error in ${context}:`, error)

  // Log to monitoring system if available
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      tags: { context: 'realtime', location: context },
    })
  }
}

// Connection state management
export const getConnectionState = () => {
  return supabase.realtime.connectionState()
}

// Reconnection logic with exponential backoff
export const setupReconnectionHandler = (channel: any, onReconnect?: () => void) => {
  channel.on('system', { event: 'CHANNEL_ERROR' }, (error: any) => {
    console.error('Channel error:', error)
    // Client handles reconnection automatically, but we can add custom logic
    setTimeout(() => {
      if (onReconnect) onReconnect()
    }, 1000)
  })
}
