import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { UAParser } from 'ua-parser-js'
import { Alert, AlertDescription } from '#/components/alert'
import { Badge } from '#/components/badge'
import { Button } from '#/components/button'
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
  CardHeaderAction
} from '#/components/card'
import { Skeleton } from '#/components/skeleton'
import { authClient } from '#/guards/auth-client'
import { formatRelativeTime, formatShortRelativeTime } from '#/utils/humanize'
import { clx } from '#/utils/variant'

interface UserSession {
  id: string
  createdAt: Date
  updatedAt: Date
  ipAddress?: string | null
  userAgent?: string | null
}

interface ParsedUA {
  device: string
  browser: string
  os: string
}

function parseUserAgent(userAgent: string): ParsedUA {
  const parser = new UAParser(userAgent)
  const browser = parser.getBrowser().name || 'Unknown'
  const os = parser.getOS().name || 'Unknown'
  const deviceType = parser.getDevice().type
  const device = deviceType ? deviceType.charAt(0).toUpperCase() + deviceType.slice(1) : 'Desktop'
  return { device, browser, os }
}

function getDeviceIcon(device: string) {
  switch (device.toLowerCase()) {
    case 'mobile':
    case 'tablet':
      return <Lucide.Smartphone className='size-5' />
    default:
      return <Lucide.Monitor className='size-5' />
  }
}

export function SessionsList() {
  const queryClient = useQueryClient()
  const router = useRouter()

  // Query for get current session
  const { data: currentSessionData } = useQuery({
    queryKey: ['current-session'],
    queryFn: async () => {
      const result = await authClient.getSession()
      return result.data?.session?.id || null
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Query for get all sessions
  const {
    data: sessions = [],
    isLoading,
    error: queryError
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const result = await authClient.listSessions()
      if (result.data && Array.isArray(result.data)) {
        return result.data.map((session: any) => ({
          id: session.id || session.token,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt || session.createdAt),
          ipAddress: session.ipAddress,
          userAgent: session.userAgent
        })) as UserSession[]
      }
      return []
    },
    staleTime: 30 * 1000 // 30 seconds
  })

  // Mutation to revoke single session (other session)
  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const result = await authClient.revokeSession({ token: sessionId })
      if (result.error) {
        throw new Error(result.error.message || 'Failed to revoke session')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['current-session'] })
    }
  })

  // Mutation for sign out from current session only
  const signOutCurrentMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut()
      if (result.error) {
        throw new Error(result.error.message || 'Failed to sign out')
      }
      return result
    },
    onSuccess: () => {
      router.navigate({ to: '/signin', search: { logout: true } })
    }
  })

  // Mutation to revoke all other sessions (keep current)
  const revokeOtherSessionsMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.revokeOtherSessions()
      if (result.error) {
        throw new Error(result.error.message || 'Failed to revoke sessions')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['current-session'] })
    }
  })

  // Mutation for sign out from semua sessions (everywhere)
  const signOutEverywhereMutation = useMutation({
    mutationFn: async () => {
      // revokeSessions() will revoke all sessions including current
      const result = await authClient.revokeSessions()
      if (result.error) {
        throw new Error(result.error.message || 'Failed to sign out from all devices')
      }
      return result
    },
    onSuccess: () => {
      router.navigate({ to: '/signin', search: { logout: true } })
    }
  })

  const handleRevokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId)
  }

  const handleSignOutCurrent = () => {
    signOutCurrentMutation.mutate()
  }

  const handleRevokeOtherSessions = () => {
    revokeOtherSessionsMutation.mutate()
  }

  const handleSignOutEverywhere = () => {
    signOutEverywhereMutation.mutate()
  }

  const currentSessionId = currentSessionData || null

  const errorMessage =
    queryError?.message ||
    revokeSessionMutation.error?.message ||
    signOutCurrentMutation.error?.message ||
    revokeOtherSessionsMutation.error?.message ||
    signOutEverywhereMutation.error?.message

  const isAnyMutationPending =
    revokeSessionMutation.isPending ||
    signOutCurrentMutation.isPending ||
    revokeOtherSessionsMutation.isPending ||
    signOutEverywhereMutation.isPending

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active sessions across devices</CardDescription>
        </CardHeader>
        <CardBody>
          <div className='space-y-3'>
            <Skeleton className='h-20 w-full' />
            <Skeleton className='h-20 w-full' />
            <Skeleton className='h-20 w-full' />
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Manage your active sessions across devices</CardDescription>
          </div>
          <CardHeaderAction>
            {sessions.length > 1 && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleRevokeOtherSessions}
                disabled={isAnyMutationPending}
              >
                {revokeOtherSessionsMutation.isPending ? 'Signing out...' : 'Revoke others'}
              </Button>
            )}

            {sessions.length > 0 && (
              <Button
                type='button'
                variant='danger'
                size='sm'
                onClick={handleSignOutEverywhere}
                disabled={isAnyMutationPending}
              >
                {signOutEverywhereMutation.isPending ? 'Signing out...' : 'Revoke all'}
              </Button>
            )}
          </CardHeaderAction>
        </div>
      </CardHeader>
      <CardBody>
        {errorMessage && (
          <Alert variant='danger'>
            <Lucide.AlertCircle className='size-4' />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className='space-y-3'>
          {sessions.length === 0 ? (
            <p className='text-on-background-neutral py-4 text-center text-sm'>
              No active sessions found
            </p>
          ) : (
            sessions.map((session) => {
              const isCurrent = session.id === currentSessionId
              const { device, browser, os } = session.userAgent
                ? parseUserAgent(session.userAgent)
                : { device: 'Unknown', browser: 'Unknown', os: 'Unknown' }

              return (
                <div
                  key={session.id}
                  className={clx(
                    'flex items-start justify-between gap-4 rounded-lg border p-4',
                    isCurrent
                      ? 'border-foreground-primary/20 bg-background-primary-faded'
                      : 'border-border-neutral'
                  )}
                >
                  <div className='flex items-start gap-3'>
                    <div className='bg-background-neutral text-on-background-neutral flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                      {getDeviceIcon(device)}
                    </div>

                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>
                          {browser} on {os}
                        </span>
                        {isCurrent && (
                          <Badge variant='success' size='sm'>
                            Current Session
                          </Badge>
                        )}
                      </div>

                      <div className='text-on-background-neutral flex items-center gap-3 text-xs'>
                        <span className='flex items-center gap-1'>
                          <Lucide.Clock className='size-3' />
                          Created: {formatRelativeTime(session.createdAt)}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Lucide.Clock className='size-3' />
                          Last active: {formatShortRelativeTime(session.updatedAt)}
                        </span>
                      </div>

                      {session.ipAddress && (
                        <div className='text-on-background-neutral flex items-center gap-1 text-xs'>
                          <span>IP: {session.ipAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions per session */}
                  <div className='flex items-center gap-1'>
                    {isCurrent ? (
                      <Button
                        type='button'
                        variant='ghost'
                        mode='icon'
                        size='sm'
                        onClick={handleSignOutCurrent}
                        disabled={signOutCurrentMutation.isPending}
                        title='Sign out from this device'
                      >
                        <Lucide.LogOut className='size-4' />
                      </Button>
                    ) : (
                      <Button
                        type='button'
                        variant='ghost'
                        mode='icon'
                        size='sm'
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={
                          revokeSessionMutation.isPending &&
                          revokeSessionMutation.variables === session.id
                        }
                        title='Revoke session'
                      >
                        <Lucide.X className='size-4' />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardBody>
    </Card>
  )
}
