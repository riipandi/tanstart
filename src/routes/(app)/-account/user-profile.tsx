import { useAsyncRateLimiter } from '@tanstack/react-pacer'
import { useRouter } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { useRef, useState, Activity, useEffect } from 'react'
import { z } from 'zod'
import { Alert, AlertDescription } from '#/components/alert'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/avatar'
import { Button } from '#/components/button'
import { Card, CardBody } from '#/components/card'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogPopup,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '#/components/dialog'
import { Form } from '#/components/form'
import { Session } from '#/guards/auth-client'
import { authClient } from '#/guards/auth-client'
import { removeAvatar, uploadAvatar } from '#/guards/avatar'
import { useAppForm } from '#/hooks/use-form'
import { clx } from '#/utils/variant'

const nameSchema = z.object({
  firstName: z.string().min(1, { error: 'First name is required' }),
  lastName: z.string().min(1, { error: 'Last name is required' })
})

const changeEmailSchema = z.object({
  newEmail: z.string().min(1, { error: 'New email is required' }),
  password: z.string().min(1, { error: 'Password is required' })
})

export function UserProfile(user: Session['user']) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [isEditingName, setIsEditingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  // Change email states
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false)
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [emailInitialSubmitTime, setEmailInitialSubmitTime] = useState<number | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const changeEmailForm = useAppForm({
    defaultValues: { newEmail: '', password: '' },
    validators: { onChangeAsync: changeEmailSchema },
    onSubmit: async ({ value }) => {
      setEmailError(null)

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value.newEmail.trim())) {
        setEmailError('Please enter a valid email address')
        return
      }

      if (value.newEmail.trim() === user.email) {
        setEmailError('New email must be different from your current email')
        return
      }

      setIsChangingEmail(true)

      try {
        const result = await authClient.changeEmail({
          newEmail: value.newEmail.trim(),
          callbackURL: '/signin'
        })

        if (result.error) {
          if (result.error.message?.toLowerCase().includes('password')) {
            setEmailError('Incorrect password. Please try again.')
          } else {
            setEmailError(result.error.message || 'Failed to send verification email')
          }
          setIsChangingEmail(false)
          return
        }

        setSubmittedEmail(value.newEmail.trim())
        setEmailVerificationSent(true)
        setEmailInitialSubmitTime(Date.now())
        setIsChangingEmail(false)
      } catch (err) {
        console.error('Change email error:', err)
        setEmailError('An unexpected error occurred. Please try again.')
        setIsChangingEmail(false)
      }
    }
  })

  // Cooldown period: 10s for DEV, 60s for other environments
  const emailCooldownPeriod = import.meta.env.DEV ? 10_000 : 60_000

  const nameParts = user.name?.split(' ') || ['', '']
  const initialFirstName = nameParts[0] || ''
  const initialLastName = nameParts.slice(1).join(' ') || ''

  const nameForm = useAppForm({
    defaultValues: { firstName: initialFirstName, lastName: initialLastName },
    validators: { onChangeAsync: nameSchema },
    onSubmit: async ({ value, formApi }) => {
      setNameError(null)

      try {
        const fullName = `${value.firstName.trim()} ${value.lastName.trim()}`
        const result = await authClient.updateUser({ name: fullName })

        if (result.error) {
          setNameError(result.error.message || 'Failed to update name')
          return
        }

        setIsEditingName(false)
        formApi.reset()
        router.invalidate()
      } catch (err) {
        console.error(err)
        setNameError('An unexpected error occurred')
      }
    }
  })

  const handleStartEdit = () => {
    setIsEditingName(true)
    setNameError(null)
    const nameParts = user.name?.split(' ') || ['', '']
    nameForm.reset({ firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '' })
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
    setNameError(null)
    const nameParts = user.name?.split(' ') || ['', '']
    nameForm.reset({ firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '' })
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    try {
      const base64 = await fileToBase64(file)

      const result = await uploadAvatar({
        data: {
          filename: file.name,
          contentType: file.type,
          base64: base64
        }
      })

      setUploadProgress(100)

      const updateResult = await authClient.updateUser({ image: result.path })

      if (updateResult.error) {
        throw new Error(updateResult.error.message)
      }

      router.invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
      console.error(err)
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user.image) return

    setIsRemoving(true)
    setError(null)

    try {
      await removeAvatar({ data: { image: user.image } })
      const updateResult = await authClient.updateUser({ image: null })

      if (updateResult.error) {
        throw new Error(updateResult.error.message)
      }

      router.invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar')
      console.error(err)
    } finally {
      setIsRemoving(false)
    }
  }

  const handleChangeEmail = () => {
    setShowChangeEmailDialog(true)
  }

  const handleCloseChangeEmailDialog = () => {
    if (!isChangingEmail) {
      setShowChangeEmailDialog(false)
      setTimeout(() => {
        setEmailError(null)
        setEmailVerificationSent(false)
        changeEmailForm.reset()
      }, 300)
    }
  }

  const resendEmailLimiter = useAsyncRateLimiter(
    async () => {
      setIsChangingEmail(true)
      setEmailError(null)

      try {
        const result = await authClient.changeEmail({
          newEmail: submittedEmail.trim(),
          callbackURL: '/signin'
        })

        if (result.error) {
          setEmailError(result.error.message || 'Failed to resend email')
          setIsChangingEmail(false)
          return
        }

        setIsChangingEmail(false)
      } catch (err) {
        console.error('Resend email error:', err)
        setEmailError('Failed to resend email. Please try again.')
        setIsChangingEmail(false)
      }
    },
    {
      limit: 1,
      window: emailCooldownPeriod,
      windowType: 'sliding'
    },
    (state) => ({
      isExceeded: state.isExceeded,
      executionTimes: state.executionTimes
    })
  )

  const handleResendEmail = () => resendEmailLimiter.maybeExecute()

  const resendEmailState = resendEmailLimiter.state

  // Force re-render for countdown
  const [, setTick] = useState(0)
  useEffect(() => {
    if (
      emailInitialSubmitTime ||
      (resendEmailState.isExceeded && resendEmailState.executionTimes.length > 0)
    ) {
      const interval = setInterval(() => {
        setTick((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [emailInitialSubmitTime, resendEmailState.isExceeded, resendEmailState.executionTimes.length])

  const handleGotIt = () => {
    handleCloseChangeEmailDialog()
  }

  // Calculate resend cooldown
  const emailCooldownEnd =
    Math.max(emailInitialSubmitTime ?? 0, resendEmailState.executionTimes[0] ?? 0) +
    emailCooldownPeriod
  const emailRemainingSeconds = Math.ceil((emailCooldownEnd - Date.now()) / 1000)
  const isEmailCooldown = emailRemainingSeconds > 0

  return (
    <Card>
      <CardBody className='relative'>
        <Activity mode={!isEditingName ? 'visible' : 'hidden'}>
          <Dialog
            open={showChangeEmailDialog}
            onOpenChange={setShowChangeEmailDialog}
            disablePointerDismissal
          >
            <DialogTrigger
              render={
                <Button
                  variant='ghost'
                  size='xs'
                  onClick={handleChangeEmail}
                  className='absolute top-5 right-5 text-xs'
                  title='Change email'
                />
              }
            >
              <Lucide.Mail size={14} />
              <span className='ml-1 hidden sm:inline'>Change</span>
            </DialogTrigger>
            <DialogPopup>
              {/* Step 1: Email Change Form */}
              <Activity mode={!emailVerificationSent ? 'visible' : 'hidden'}>
                <DialogHeader>
                  <div className='flex items-center gap-3'>
                    <div className='bg-background-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                      <Lucide.Mail className='text-foreground-primary h-5 w-5' />
                    </div>
                    <DialogTitle>Change Email Address</DialogTitle>
                  </div>
                  <DialogClose
                    className='ml-auto'
                    // onClick={handleCloseDialog}
                    // disabled={isSubmitting}
                  >
                    <Lucide.XIcon className='size-4' strokeWidth={2.0} />
                  </DialogClose>
                </DialogHeader>
                <DialogBody>
                  <p className='text-on-background-neutral text-sm'>
                    To confirm this change, please enter your new email address and current
                    password. We&apos;ll send a verification link to your new email address.
                  </p>
                  {emailError && (
                    <Alert variant='danger' className='mt-4'>
                      <Lucide.AlertCircle className='size-4' />
                      <AlertDescription>{emailError}</AlertDescription>
                    </Alert>
                  )}
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      changeEmailForm.handleSubmit()
                    }}
                    className='mt-4 grid gap-4'
                  >
                    <changeEmailForm.AppField
                      name='newEmail'
                      validators={{
                        onBlur: ({ value }) => {
                          if (!value || value.trim().length === 0) {
                            return 'New email is required'
                          }
                          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                            return 'Please enter a valid email address'
                          }
                          if (value.trim() === user.email) {
                            return 'New email must be different from your current email'
                          }
                          return undefined
                        }
                      }}
                    >
                      {(field) => <field.TextField label='New email address' />}
                    </changeEmailForm.AppField>

                    <changeEmailForm.AppField
                      name='password'
                      validators={{
                        onBlur: ({ value }) => {
                          if (!value || value.trim().length === 0) {
                            return 'Password is required'
                          }
                          return undefined
                        }
                      }}
                    >
                      {(field) => <field.PasswordField label='Current password' />}
                    </changeEmailForm.AppField>
                  </Form>
                </DialogBody>
                <DialogFooter>
                  <DialogClose render={<Button variant='outline' disabled={isChangingEmail} />}>
                    Cancel
                  </DialogClose>
                  <changeEmailForm.AppForm>
                    <changeEmailForm.SubmitButton label='Change Email' />
                  </changeEmailForm.AppForm>
                </DialogFooter>
              </Activity>

              {/* Step 2: Email Sent */}
              <Activity mode={emailVerificationSent ? 'visible' : 'hidden'}>
                <DialogHeader>
                  <div className='mb-6 flex flex-col items-center text-center'>
                    <div className='bg-background-primary-faded mb-3 flex h-14 w-14 items-center justify-center rounded-full'>
                      <Lucide.Mail className='text-foreground-primary h-7 w-7' />
                    </div>
                    <DialogTitle>Check Your New Email</DialogTitle>
                    <DialogDescription>
                      We&apos;ve sent a verification link to {submittedEmail}
                    </DialogDescription>
                  </div>
                </DialogHeader>
                <DialogBody>
                  <Alert variant='info'>
                    <AlertDescription>
                      Please check your inbox and click the verification link to complete the email
                      change.
                      <br />
                      <strong>Important:</strong> This link will expire in 24 hours.
                    </AlertDescription>
                  </Alert>
                  <div className='mb-4 text-center'>
                    <p className='text-on-background-neutral text-sm'>
                      Didn&apos;t receive the email?
                    </p>
                    <Button
                      type='button'
                      variant='primary'
                      mode='link'
                      size='sm'
                      onClick={handleResendEmail}
                      disabled={isEmailCooldown || isChangingEmail}
                    >
                      {isChangingEmail ? (
                        <span className='flex items-center justify-center gap-1'>
                          <Lucide.Loader2 className='h-3 w-3 animate-spin' />
                          Resending...
                        </span>
                      ) : isEmailCooldown ? (
                        `Resend in ${emailRemainingSeconds}s`
                      ) : (
                        'Resend email'
                      )}
                    </Button>
                  </div>
                  {emailError && (
                    <Alert variant='danger'>
                      <Lucide.AlertCircle className='size-4' />
                      <AlertDescription>{emailError}</AlertDescription>
                    </Alert>
                  )}
                </DialogBody>
                <DialogFooter>
                  <Button variant='primary' onClick={handleGotIt}>
                    Got it
                  </Button>
                </DialogFooter>
              </Activity>
            </DialogPopup>
          </Dialog>
        </Activity>

        <div className='flex items-start justify-center gap-6 px-1'>
          <div className='flex flex-col items-center gap-2 pt-1.5'>
            <button
              type='button'
              className='group border-border-neutral relative size-14 cursor-pointer rounded-full border bg-white p-2'
              onClick={handleAvatarClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleAvatarClick()
                }
              }}
              disabled={isUploading}
            >
              <Avatar
                className={clx(
                  'absolute inset-0 flex size-full items-center justify-center rounded-full',
                  isUploading && 'opacity-30'
                )}
              >
                <AvatarImage
                  src={user.image || '/images/default-avatar.png'}
                  alt={user.name || 'User avatar'}
                />
                <AvatarFallback asInitial>{user.name}</AvatarFallback>
              </Avatar>

              <div className='absolute inset-0 flex size-full items-center justify-center rounded-full transition-opacity duration-200'>
                {isUploading ? (
                  <div className='relative flex size-full items-center justify-center'>
                    <svg className='absolute size-full -rotate-90' viewBox='0 0 36 36'>
                      <path
                        className='stroke-black/10'
                        strokeWidth={3}
                        fill='none'
                        d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                      />
                      <path
                        className='stroke-background-primary transition-all duration-300 ease-out'
                        strokeWidth={3}
                        strokeLinecap='round'
                        strokeDasharray={`${uploadProgress}, 100`}
                        fill='none'
                        d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                      />
                    </svg>
                    <span className='text-foreground-neutral text-xs font-semibold'>
                      {uploadProgress}%
                    </span>
                  </div>
                ) : (
                  <div className='flex size-full items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                    <Lucide.Camera className='text-white' size={20} />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                className='hidden'
                disabled={isUploading}
              />
            </button>

            {user.image && (
              <Button
                type='button'
                variant='ghost'
                size='xs'
                onClick={handleRemoveAvatar}
                disabled={isRemoving}
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </Button>
            )}
          </div>

          <div className='flex-1'>
            <div className='w-full space-y-1'>
              <Activity mode={isEditingName ? 'visible' : 'hidden'}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    nameForm.handleSubmit()
                  }}
                  className='space-y-3'
                >
                  <div className='grid grid-cols-2 gap-4'>
                    <nameForm.AppField
                      name='firstName'
                      validators={{
                        onBlur: ({ value }) => {
                          if (!value || value.trim().length === 0) {
                            return 'First name is required'
                          }
                          return undefined
                        }
                      }}
                    >
                      {(field) => <field.TextField label='First Name' placeholder='First Name' />}
                    </nameForm.AppField>

                    <nameForm.AppField
                      name='lastName'
                      validators={{
                        onBlur: ({ value }) => {
                          if (!value || value.trim().length === 0) {
                            return 'Last name is required'
                          }
                          return undefined
                        }
                      }}
                    >
                      {(field) => <field.TextField label='Last Name' placeholder='Last Name' />}
                    </nameForm.AppField>
                  </div>
                  <div className='flex items-center gap-2'>
                    <nameForm.AppForm>
                      <nameForm.SubmitButton label='Save' size='sm' />
                    </nameForm.AppForm>
                    <Button size='sm' variant='outline' onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                  {nameError && <p className='text-foreground-critical text-xs'>{nameError}</p>}
                </form>
              </Activity>

              <Activity mode={!isEditingName ? 'visible' : 'hidden'}>
                <div>
                  <div className='group flex items-center gap-2'>
                    <span className='text-on-background-neutral hover:text-foreground-neutral text-left text-lg font-semibold transition-colors'>
                      {user.name}
                    </span>
                    <Button
                      type='button'
                      variant='ghost'
                      mode='icon'
                      size='xs'
                      onClick={handleStartEdit}
                      className='opacity-0 group-hover:opacity-100'
                      title='Edit name'
                    >
                      <Lucide.Pencil size={14} />
                    </Button>
                  </div>
                  <p className='text-sm font-medium'>{user.email}</p>
                  <span className='text-xs'>
                    Member since {user.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </Activity>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant='danger' className='mt-4'>
            <Lucide.AlertCircle className='size-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardBody>
    </Card>
  )
}
