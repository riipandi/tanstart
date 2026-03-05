import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as Lucide from 'lucide-react'
import { Activity, useState } from 'react'
import { Alert, AlertDescription } from '#/components/alert'
import { Button } from '#/components/button'
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
  CardHeaderAction
} from '#/components/card'
import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose
} from '#/components/dialog'
import { Field } from '#/components/field'
import { Input } from '#/components/input'
import { Label } from '#/components/label'
import { Radio, RadioGroup, RadioGroupLabel } from '#/components/radio'
import { Skeleton } from '#/components/skeleton'
import { addPasskey, deletePasskey, listUserPasskeys, type PasskeyInfo } from '#/hooks/use-passkey'

type AuthenticatorType = 'platform' | 'cross-platform'

export function PasskeyList() {
  const queryClient = useQueryClient()

  const {
    data: passkeys = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-passkeys'],
    queryFn: async () => {
      const result = await listUserPasskeys()
      if (result.error) {
        throw new Error(result.error)
      }
      return result.data ?? []
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deletePasskey(id)
      if (result.error) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-passkeys'] })
    }
  })

  const addMutation = useMutation({
    mutationFn: async (options: { name: string; authenticatorAttachment: AuthenticatorType }) => {
      const result = await addPasskey({
        name: options.name,
        authenticatorAttachment: options.authenticatorAttachment
      })
      if (result.error) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-passkeys'] })
    }
  })

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPasskey, setSelectedPasskey] = useState<PasskeyInfo | null>(null)

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [passkeyName, setPasskeyName] = useState('')
  const [authenticatorType, setAuthenticatorType] = useState<AuthenticatorType>('platform')
  const [addDialogError, setAddDialogError] = useState<string | null>(null)

  const handleDeleteClick = (passkey: PasskeyInfo) => {
    setSelectedPasskey(passkey)
    setShowDeleteDialog(true)
  }

  const handleDeleteClose = () => {
    if (!deleteMutation.isPending) {
      setShowDeleteDialog(false)
      setSelectedPasskey(null)
    }
  }

  const handleAddClose = () => {
    if (!addMutation.isPending) {
      setShowAddDialog(false)
      setPasskeyName('')
      setAuthenticatorType('platform')
      setAddDialogError(null)
    }
  }

  const handleAddSubmit = async () => {
    if (!passkeyName.trim()) {
      setAddDialogError('Passkey name is required')
      return
    }

    setAddDialogError(null)
    addMutation.mutate(
      {
        name: passkeyName.trim(),
        authenticatorAttachment: authenticatorType
      },
      {
        onSuccess: () => {
          setShowAddDialog(false)
          setPasskeyName('')
          setAuthenticatorType('platform')
        },
        onError: (err) => {
          setAddDialogError(err instanceof Error ? err.message : 'Failed to add passkey')
        }
      }
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passkeys</CardTitle>
        <CardDescription>
          {passkeys.length > 0
            ? `Manage your registered passkeys (${passkeys.length})`
            : 'Use passkeys to sign in without a password'}
        </CardDescription>
        <CardHeaderAction>
          <div className='flex gap-2'>
            {passkeys.length > 0 && (
              <Button
                variant='outline'
                onClick={() => queryClient.invalidateQueries({ queryKey: ['user-passkeys'] })}
                disabled={isLoading}
              >
                <Lucide.RefreshCcw className={`mr-2 size-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog} disablePointerDismissal>
              <DialogTrigger render={<Button type='button' variant='primary' />}>
                Add Passkey
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeaderAction>
      </CardHeader>

      <CardBody className='pb-0'>
        {error && (
          <div className='mb-4'>
            <Alert variant='danger'>
              <Lucide.AlertCircle className='size-4' />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          </div>
        )}

        {isLoading ? (
          <div className='space-y-3'>
            <Skeleton className='h-18 w-full' />
            <Skeleton className='h-18 w-full' />
          </div>
        ) : passkeys.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <div className='bg-background-neutral-faded mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
              <Lucide.Key className='text-on-background-neutral size-6' />
            </div>
            <p className='text-on-background-neutral text-sm font-medium'>
              No passkeys registered yet
            </p>
            <p className='text-on-background-neutral text-sm'>
              Add a passkey to sign in with biometrics or your device
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className='border-border-neutral-faded flex items-center justify-between rounded-lg border p-4'
              >
                <div className='flex items-center gap-3'>
                  <div className='bg-background-neutral-faded flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                    <Lucide.ShieldCheck className='text-on-background-neutral size-5' />
                  </div>
                  <div>
                    <div className='font-medium'>{passkey.name}</div>
                    <p className='text-on-background-neutral text-xs'>
                      Added {formatDate(passkey.createdAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleDeleteClick(passkey)}
                  className='text-foreground-critical hover:bg-background-critical/10'
                >
                  <Lucide.Trash2 className='size-4' />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} disablePointerDismissal>
          <DialogTrigger />
          <DialogPopup>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='bg-background-critical/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                  <Lucide.AlertTriangle className='text-foreground-critical h-5 w-5' />
                </div>
                <div>
                  <DialogTitle>Delete Passkey?</DialogTitle>
                  <DialogDescription>
                    This will remove the passkey from your account
                  </DialogDescription>
                </div>
              </div>
              <DialogClose
                className='ml-auto'
                onClick={handleDeleteClose}
                disabled={deleteMutation.isPending}
              >
                <Lucide.XIcon className='size-4' strokeWidth={2.0} />
              </DialogClose>
            </DialogHeader>
            <DialogBody>
              <Alert variant='danger' className='mb-4'>
                <Lucide.AlertTriangle className='size-4' />
                <AlertDescription>
                  <strong>
                    Warning: You won&apos;t be able to sign in with this passkey anymore
                  </strong>
                  <br />
                  This action cannot be undone. If this is your only passkey, make sure you have
                  another way to access your account.
                </AlertDescription>
              </Alert>

              {selectedPasskey && (
                <div className='bg-background-neutral-faded rounded-lg p-3'>
                  <div className='text-sm font-medium'>{selectedPasskey.name}</div>
                  <div className='text-on-background-neutral text-xs'>
                    Added {formatDate(selectedPasskey.createdAt)}
                  </div>
                </div>
              )}

              {deleteMutation.isError && (
                <div className='text-foreground-critical mt-4 text-sm'>
                  {deleteMutation.error instanceof Error
                    ? deleteMutation.error.message
                    : 'Failed to delete passkey'}
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={handleDeleteClose}
                disabled={deleteMutation.isPending}
                block
              >
                Cancel
              </Button>
              <Button
                variant='danger'
                onClick={() => {
                  if (selectedPasskey) {
                    deleteMutation.mutate(selectedPasskey.id, {
                      onSuccess: () => {
                        setShowDeleteDialog(false)
                        setSelectedPasskey(null)
                      }
                    })
                  }
                }}
                disabled={deleteMutation.isPending}
                block
              >
                {deleteMutation.isPending ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Lucide.Loader2 className='size-4 animate-spin' />
                    Deleting...
                  </span>
                ) : (
                  'Delete Passkey'
                )}
              </Button>
            </DialogFooter>
          </DialogPopup>
        </Dialog>

        {/* Add Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog} disablePointerDismissal>
          <DialogTrigger />
          <DialogPopup>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='bg-background-primary-faded flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                  <Lucide.Key className='text-foreground-primary h-5 w-5' />
                </div>
                <div>
                  <DialogTitle>Create Passkey</DialogTitle>
                  <DialogDescription>Add passwordless authentication</DialogDescription>
                </div>
              </div>
              <DialogClose
                className='ml-auto'
                onClick={handleAddClose}
                disabled={addMutation.isPending}
              >
                <Lucide.XIcon className='size-4' strokeWidth={2.0} />
              </DialogClose>
            </DialogHeader>
            <DialogBody>
              <Activity mode={!addDialogError ? 'visible' : 'hidden'}>
                <Alert variant='info' className='mb-4'>
                  <Lucide.Info className='size-4' />
                  <AlertDescription>
                    Your browser will prompt you to create a passkey using biometrics (Face ID,
                    Touch ID) or your device&apos;s screen lock PIN.
                  </AlertDescription>
                </Alert>
              </Activity>

              <Activity mode={addDialogError ? 'visible' : 'hidden'}>
                <Alert variant='danger' className='mb-4'>
                  <Lucide.Info className='size-4' />
                  <AlertDescription>{addDialogError}</AlertDescription>
                </Alert>
              </Activity>

              <Field>
                <Label htmlFor='passkey-name'>Passkey Name</Label>
                <Input
                  id='passkey-name'
                  value={passkeyName}
                  onChange={(e) => {
                    setPasskeyName(e.target.value)
                    if (addDialogError) setAddDialogError(null)
                  }}
                  placeholder='e.g., My MacBook, Work Phone'
                  disabled={addMutation.isPending}
                  autoFocus
                />
              </Field>

              <Field className='mt-4'>
                <RadioGroupLabel>Authenticator Type</RadioGroupLabel>
                <RadioGroup
                  value={authenticatorType}
                  onValueChange={(value) => setAuthenticatorType(value as AuthenticatorType)}
                  className='mt-2 space-y-2'
                >
                  <label
                    className={`border-border-neutral-faded flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                      authenticatorType === 'platform'
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-background-neutral-faded'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <Radio value='platform' disabled={addMutation.isPending} />
                      <div>
                        <div className='text-sm font-medium'>Platform Authenticator</div>
                        <div className='text-on-background-neutral text-xs'>
                          Face ID, Touch ID, Windows Hello, etc.
                        </div>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`border-border-neutral-faded flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                      authenticatorType === 'cross-platform'
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-background-neutral-faded'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <Radio value='cross-platform' disabled={addMutation.isPending} />
                      <div>
                        <div className='text-sm font-medium'>Cross-Platform Authenticator</div>
                        <div className='text-on-background-neutral text-xs'>
                          Security keys, USB keys, etc.
                        </div>
                      </div>
                    </div>
                  </label>
                </RadioGroup>
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={handleAddClose}
                disabled={addMutation.isPending}
                block
              >
                Cancel
              </Button>
              <Button
                variant='primary'
                onClick={handleAddSubmit}
                disabled={!passkeyName.trim() || addMutation.isPending}
                block
              >
                {addMutation.isPending ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Lucide.Loader2 className='size-4 animate-spin' />
                    Creating...
                  </span>
                ) : (
                  'Create Passkey'
                )}
              </Button>
            </DialogFooter>
          </DialogPopup>
        </Dialog>
      </CardBody>
    </Card>
  )
}
