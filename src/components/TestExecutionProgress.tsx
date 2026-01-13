import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Square, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { useTestExecutionRealtime } from '@/hooks/useRealtime'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

interface TestExecution {
  execution_id: string
  project_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  total_tests: number
  passed_tests: number
  failed_tests: number
  skipped_tests: number
  duration_ms?: number
  environment?: string
  browser?: string
  started_at?: string
}

interface TestExecutionProgressProps {
  projectId: string
  className?: string
}

export const TestExecutionProgress: React.FC<TestExecutionProgressProps> = ({
  projectId,
  className
}) => {
  const [executions, setExecutions] = useState<TestExecution[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load recent executions
  useEffect(() => {
    const loadExecutions = async () => {
      try {
        const { data, error } = await supabase
          .from('test_executions')
          .select('*')
          .eq('project_id', projectId)
          .order('started_at', { ascending: false })
          .limit(10)

        if (error) throw error

        setExecutions(data || [])
      } catch (error) {
        console.error('Error loading executions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (projectId) {
      loadExecutions()
    }
  }, [projectId])

  // Handle realtime updates
  const { executions: realtimeExecutions } = useTestExecutionRealtime(projectId)

  useEffect(() => {
    if (realtimeExecutions.length > 0) {
      setExecutions(prev => {
        const updated = [...prev]
        realtimeExecutions.forEach(realtimeExec => {
          const existingIndex = updated.findIndex(exec => exec.execution_id === realtimeExec.execution_id)
          if (existingIndex >= 0) {
            updated[existingIndex] = { ...updated[existingIndex], ...realtimeExec }
          } else {
            updated.unshift(realtimeExec)
          }
        })
        return updated.slice(0, 10) // Keep only latest 10
      })
    }
  }, [realtimeExecutions])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <Square className="h-4 w-4 text-gray-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      case 'cancelled':
        return 'bg-gray-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-orange-500'
    }
  }

  const getProgressPercentage = (execution: TestExecution) => {
    if (execution.status === 'pending') return 0
    if (execution.status === 'completed' || execution.status === 'failed') return 100

    const total = execution.total_tests || 1
    const completed = execution.passed_tests + execution.failed_tests + execution.skipped_tests
    return Math.round((completed / total) * 100)
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return '--'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Test Execution Progress
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {executions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No test executions found</p>
            <p className="text-sm">Start your first test run to see progress here</p>
          </div>
        ) : (
          executions.map((execution) => (
            <div key={execution.execution_id} className="border rounded-lg p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(execution.status)}
                  <span className="font-medium">
                    Execution #{execution.execution_id.slice(-8)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {execution.environment || 'unknown'}
                  </Badge>
                  {execution.browser && (
                    <Badge variant="outline" className="text-xs">
                      {execution.browser}
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(execution.started_at || Date.now()), { addSuffix: true })}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{getProgressPercentage(execution)}%</span>
                </div>
                <Progress
                  value={getProgressPercentage(execution)}
                  className="h-2"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-green-600">{execution.passed_tests || 0}</div>
                  <div className="text-muted-foreground">Passed</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600">{execution.failed_tests || 0}</div>
                  <div className="text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-600">{execution.skipped_tests || 0}</div>
                  <div className="text-muted-foreground">Skipped</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{formatDuration(execution.duration_ms)}</div>
                  <div className="text-muted-foreground">Duration</div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-between items-center">
                <Badge
                  className={`${getStatusColor(execution.status)} text-white`}
                >
                  {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                </Badge>

                {execution.status === 'running' && (
                  <Button variant="outline" size="sm">
                    <Square className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
