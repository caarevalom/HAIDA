import React, { useState, useEffect, useCallback } from 'react'
import { useSpecificationRealtime } from '@/hooks/useRealtime'
import { supabase } from '@/lib/supabase'
import { REALTIME_EVENTS } from '@/lib/supabase'

interface Specification {
  id: string
  name: string
  content: string
  version: number
  is_locked: boolean
  locked_by?: string | null
  locked_at?: string | null
  status: string
  created_by: string
  updated_at: string
}

interface SpecificationEditorProps {
  projectId: string
  specificationId: string
  currentUserId: string
  currentUserName: string
  className?: string
}

export const SpecificationEditor: React.FC<SpecificationEditorProps> = ({
  projectId,
  specificationId,
  currentUserId,
  currentUserName,
  className
}) => {
  const [specification, setSpecification] = useState<Specification | null>(null)
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load specification
  useEffect(() => {
    const loadSpecification = async () => {
      try {
        const { data, error } = await supabase
          .from('specifications')
          .select('*')
          .eq('id', specificationId)
          .single()

        if (error) throw error

        setSpecification(data)
        setContent(data.content)
      } catch (error) {
        console.error('Error loading specification:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (specificationId) {
      loadSpecification()
    }
  }, [specificationId])

  // Handle realtime updates
  const handleRealtimeMessage = useCallback((event: string, payload: any) => {
    if (payload.specification_id === specificationId) {
      switch (event) {
        case REALTIME_EVENTS.SPECIFICATION_UPDATED:
          // Update specification data
          setSpecification(prev => prev ? { ...prev, ...payload } : null)

          // If someone else is editing and locked it, stop editing
          if (payload.is_locked && payload.locked_by !== currentUserId && isEditing) {
            setIsEditing(false)
            // Show notification that someone else locked it
          }

          // If content changed and we're not editing, update our content
          if (!isEditing && payload.content) {
            setContent(payload.content)
          }
          break
      }
    }
  }, [specificationId, currentUserId, isEditing])

  const { collaborators, isLocked, lockedBy } = useSpecificationRealtime(
    projectId,
    specificationId
  )

  // Listen for realtime updates
  useEffect(() => {
    const channel = supabase.channel(`project:${projectId}`)
    channel.on('broadcast', { event: REALTIME_EVENTS.SPECIFICATION_UPDATED }, (payload: any) => {
      handleRealtimeMessage(REALTIME_EVENTS.SPECIFICATION_UPDATED, payload)
    })
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, handleRealtimeMessage])

  // Handle locking/unlocking
  const handleToggleLock = async () => {
    if (!specification) return

    try {
      const newLockedState = !isLocked
      const updateData: any = {
        is_locked: newLockedState,
        version: specification.version + 1
      }

      if (newLockedState) {
        updateData.locked_by = currentUserId
        updateData.locked_at = new Date().toISOString()
        setIsEditing(true)
      } else {
        updateData.locked_by = null
        updateData.locked_at = null
        setIsEditing(false)
      }

      const { error } = await supabase
        .from('specifications')
        .update(updateData)
        .eq('id', specificationId)

      if (error) throw error

      setSpecification(prev => prev ? { ...prev, ...updateData } : null)
    } catch (error) {
      console.error('Error toggling lock:', error)
    }
  }

  // Handle saving changes
  const handleSave = async () => {
    if (!specification || !isEditing) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('specifications')
        .update({
          content,
          version: specification.version + 1
        })
        .eq('id', specificationId)

      if (error) throw error

      // Unlock after saving
      await supabase
        .from('specifications')
        .update({
          is_locked: false,
          locked_by: null,
          locked_at: null
        })
        .eq('id', specificationId)

      setIsEditing(false)
      setSpecification(prev => prev ? {
        ...prev,
        content,
        version: prev.version + 1,
        is_locked: false,
        locked_by: null,
        locked_at: null
      } : null)

    } catch (error) {
      console.error('Error saving specification:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent)

    // Auto-save draft (could debounce this)
    if (isEditing) {
      // In a real app, you might want to save drafts periodically
    }
  }

  const canEdit = !isLocked || lockedBy === currentUserId
  const isLockedBySomeoneElse = isLocked && lockedBy !== currentUserId

  if (isLoading) {
    return (
      <div className={`border rounded-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!specification) {
    return (
      <div className={`border rounded-lg p-6 text-center text-gray-500 ${className}`}>
        Specification not found
      </div>
    )
  }

  return (
    <div className={`border rounded-lg ${className}`}>
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📝 {specification.name}
          </h3>

          <div className="flex items-center gap-4">
            {/* Collaborators */}
            <div className="flex items-center gap-2">
              👥
              <div className="flex -space-x-2">
                {collaborators.slice(0, 3).map((userId, index) => (
                  <div key={userId} className="h-6 w-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs text-white">
                    {userId.charAt(0).toUpperCase()}
                  </div>
                ))}
                {collaborators.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                    +{collaborators.length - 3}
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <span className={`px-2 py-1 rounded text-xs ${
              specification.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {specification.status}
            </span>

            {/* Lock/Unlock button */}
            <button
              onClick={handleToggleLock}
              disabled={isLockedBySomeoneElse}
              className={`px-3 py-1 rounded text-sm ${
                isLocked
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'border border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLocked ? '🔒 Unlock' : '🔓 Lock to Edit'}
            </button>

            {/* Save button */}
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 {isSaving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>

        {/* Lock status */}
        {isLocked && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            🔒
            <span>
              Locked by {lockedBy === currentUserId ? 'you' : 'another user'}
              {lockedBy !== currentUserId && ` (${collaborators.find(name => name === lockedBy) || 'Unknown'})`}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="space-y-4">
          {/* Version info */}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Version {specification.version}</span>
            <span>Last updated: {new Date(specification.updated_at).toLocaleString()}</span>
          </div>

          {/* Content editor */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleContentChange(e.target.value)}
              placeholder="Enter specification content..."
              className={`w-full min-h-96 p-3 border rounded font-mono text-sm ${
                !canEdit ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
              }`}
              disabled={!canEdit}
            />

            {!canEdit && (
              <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                  👁️
                  <p className="text-gray-600 mt-2">Specification is locked for editing</p>
                  <p className="text-sm text-gray-500">Wait for the current editor to finish</p>
                </div>
              </div>
            )}
          </div>

          {/* Character count */}
          <div className="text-right text-sm text-gray-500">
            {content.length} characters
          </div>
        </div>
      </div>
    </div>
  )
}
