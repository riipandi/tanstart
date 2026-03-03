import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription } from '#/components/alert'
import { Badge } from '#/components/badge'
import { Button } from '#/components/button'
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '#/components/card'
import { Skeleton } from '#/components/skeleton'
import { authClient } from '#/guards/auth-client'
import { clx } from '#/utils/variant'

interface LinkedAccount {
  id: string
  providerId: string
  accountId: string
  createdAt: Date
  updatedAt: Date
}

const providerConfig: Record<string, { icon: React.ReactNode; name: string; color: string }> = {
  google: {
    name: 'Google',
    color: '#4285F4',
    icon: (
      <svg className='h-5 w-5' viewBox='0 0 24 24' aria-hidden='true'>
        <path
          fill='#4285F4'
          d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        />
        <path
          fill='#34A853'
          d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        />
        <path
          fill='#FBBC05'
          d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
        />
        <path
          fill='#EA4335'
          d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        />
      </svg>
    )
  },
  github: {
    name: 'GitHub',
    color: '#333',
    icon: (
      <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
        <path
          fillRule='evenodd'
          d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
          clipRule='evenodd'
        />
      </svg>
    )
  }
}

// Available providers for linking
const availableProviders = ['google', 'github'] as const

type ProviderId = (typeof availableProviders)[number]

export function SocialAccounts() {
  const queryClient = useQueryClient()
  const [isLinking, setIsLinking] = useState<string | null>(null)

  // Query to fetch linked accounts
  const {
    data: accounts = [],
    isLoading,
    error: queryError
  } = useQuery({
    queryKey: ['linked-accounts'],
    queryFn: async () => {
      const result = await authClient.listAccounts()
      if (result.data && Array.isArray(result.data)) {
        return result.data.map((account: any) => ({
          id: account.id || `${account.providerId}-${account.accountId}`,
          providerId: account.providerId,
          accountId: account.accountId,
          createdAt: new Date(account.createdAt),
          updatedAt: new Date(account.updatedAt || account.createdAt)
        })) as LinkedAccount[]
      }
      return []
    },
    staleTime: 30 * 1000 // 30 seconds
  })

  // Mutation to unlink an account
  const unlinkMutation = useMutation({
    mutationFn: async ({ providerId, accountId }: { providerId: string; accountId: string }) => {
      const result = await authClient.unlinkAccount({
        providerId,
        accountId
      })
      if (result.error) {
        throw new Error(result.error.message || 'Failed to unlink account')
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-accounts'] })
    }
  })

  // Handle link social account
  const handleLinkAccount = async (provider: ProviderId) => {
    setIsLinking(provider)
    try {
      const result = await authClient.linkSocial({
        provider,
        callbackURL: '/account?linked=true'
      })
      if (result.error) {
        throw new Error(result.error.message || `Failed to link ${provider} account`)
      }
    } catch (err) {
      console.error(err)
      setIsLinking(null)
    }
  }

  // Handle unlink account
  const handleUnlinkAccount = (providerId: string, accountId: string) => {
    unlinkMutation.mutate({ providerId, accountId })
  }

  // Check if a provider is already linked
  const isProviderLinked = (providerId: string) => {
    return accounts.some((account) => account.providerId === providerId)
  }

  // Get linked account info for a provider
  const getLinkedAccount = (providerId: string) => {
    return accounts.find((account) => account.providerId === providerId)
  }

  const errorMessage = queryError?.message || unlinkMutation.error?.message

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>Manage your linked social accounts</CardDescription>
      </CardHeader>
      <CardBody>
        {errorMessage && (
          <Alert variant='danger'>
            <Lucide.AlertCircle className='size-4' />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className='space-y-3'>
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
          </div>
        ) : (
          <div className='space-y-3'>
            {availableProviders.map((providerId) => {
              const config = providerConfig[providerId]
              if (!config) return null

              const linked = isProviderLinked(providerId)
              const account = getLinkedAccount(providerId)
              const isProcessing = unlinkMutation.isPending || isLinking === providerId

              return (
                <div
                  key={providerId}
                  className={clx(
                    'flex items-center justify-between rounded-lg border p-4',
                    linked
                      ? 'border-border-neutral bg-background-neutral-faded/30'
                      : 'border-border-neutral-faded'
                  )}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={clx(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        linked ? 'bg-background-neutral' : 'bg-background-neutral-faded'
                      )}
                    >
                      {config.icon}
                    </div>

                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>{config.name}</span>
                        {linked && (
                          <Badge variant='success' size='sm'>
                            Connected
                          </Badge>
                        )}
                      </div>
                      <p className='text-on-background-neutral text-xs'>
                        {linked
                          ? `Connected on ${account?.createdAt.toLocaleDateString()}`
                          : `Connect your ${config.name} account`}
                      </p>
                    </div>
                  </div>

                  {linked && account ? (
                    <Button
                      size='sm'
                      variant='danger'
                      onClick={() => handleUnlinkAccount(account.providerId, account.accountId)}
                      disabled={isProcessing}
                    >
                      {unlinkMutation.isPending ? 'Unlinking...' : 'Unlink'}
                    </Button>
                  ) : (
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleLinkAccount(providerId)}
                      disabled={isProcessing}
                    >
                      {isLinking === providerId ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
