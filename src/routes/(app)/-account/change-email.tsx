import { useAsyncRateLimiter } from '@tanstack/react-pacer'
import * as Lucide from 'lucide-react'
import { Activity, useEffect, useState } from 'react'
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
import { InputPassword } from '#/components/input-password'
import { Label } from '#/components/label'
import { authClient } from '#/guards/auth-client'

export function ChangeEmail({ email: currentEmail }: { email: string }) {
  const [showDialog, setShowDialog] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const [initialSubmitTime, setInitialSubmitTime] = useState<number | null>(null)

  const cooldownPeriod = import.meta.env.DEV ? 10_000 : 60_000

  const handleCloseDialog = () => {
    if (!isSubmitting) {
      setShowDialog(false)
      setTimeout(() => {
        setError(null)
        setNewEmail('')
        setPassword('')
        setEmailSent(false)
        setSubmittedEmail('')
      }, 300)
    }
  }

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail.trim())) {
      setError('Please enter a valid email address')
      return
    }

    if (newEmail.trim() === currentEmail) {
      setError('New email must be different from your current email')
      return
    }

    if (!password.trim()) {
      setError('Password is required to change your email')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await authClient.changeEmail({
        newEmail: newEmail.trim(),
        callbackURL: '/account?email_changed=true'
      })

      if (result.error) {
        if (result.error.message?.toLowerCase().includes('password')) {
          setError('Incorrect password. Please try again.')
        } else {
          setError(result.error.message || 'Failed to send verification email')
        }
        setIsSubmitting(false)
        return
      }

      setSubmittedEmail(newEmail.trim())
      setEmailSent(true)
      setInitialSubmitTime(Date.now())
      setIsSubmitting(false)
    } catch (err) {
      console.error('Change email error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const resendLimiter = useAsyncRateLimiter(
    async () => {
      setIsSubmitting(true)
      setError(null)

      try {
        const result = await authClient.changeEmail({
          newEmail: submittedEmail.trim(),
          callbackURL: '/signin'
        })

        if (result.error) {
          setError(result.error.message || 'Failed to resend email')
          setIsSubmitting(false)
          return
        }

        setIsSubmitting(false)
      } catch (err) {
        console.error('Resend email error:', err)
        setError('Failed to resend email. Please try again.')
        setIsSubmitting(false)
      }
    },
    {
      limit: 1,
      window: cooldownPeriod,
      windowType: 'sliding'
    },
    (state) => ({
      isExceeded: state.isExceeded,
      executionTimes: state.executionTimes
    })
  )

  const handleResendEmail = () => resendLimiter.maybeExecute()
  const resendState = resendLimiter.state

  const [, setTick] = useState(0)
  useEffect(() => {
    if (initialSubmitTime || (resendState.isExceeded && resendState.executionTimes.length > 0)) {
      const interval = setInterval(() => {
        setTick((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [initialSubmitTime, resendState.isExceeded, resendState.executionTimes.length])

  const cooldownEnd =
    Math.max(initialSubmitTime ?? 0, resendState.executionTimes[0] ?? 0) + cooldownPeriod
  const remainingSeconds = Math.ceil((cooldownEnd - Date.now()) / 1000)
  const isCooldown = remainingSeconds > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Address</CardTitle>
        <CardDescription>Change your email address</CardDescription>
        <CardHeaderAction>
          <Dialog open={showDialog} onOpenChange={setShowDialog} disablePointerDismissal>
            <DialogTrigger render={<Button type='button' variant='outline' size='sm' />}>
              Change
            </DialogTrigger>
            <DialogPopup>
              <Activity mode={!emailSent ? 'visible' : 'hidden'}>
                <DialogHeader>
                  <div className='flex items-center gap-3'>
                    <div className='bg-background-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                      <Lucide.Mail className='text-foreground-primary h-5 w-5' />
                    </div>
                    <div>
                      <DialogTitle>Change Email Address</DialogTitle>
                      <DialogDescription>Enter your new email address</DialogDescription>
                    </div>
                  </div>
                  <DialogClose
                    className='ml-auto'
                    onClick={handleCloseDialog}
                    disabled={isSubmitting}
                  >
                    <Lucide.XIcon className='size-4' strokeWidth={2.0} />
                  </DialogClose>
                </DialogHeader>
                <DialogBody>
                  <p className='text-on-background-neutral text-sm'>
                    To confirm this change, please enter your new email address and current
                    password. We&apos;ll send a verification link to your new email.
                  </p>
                  {error && (
                    <Alert variant='danger' className='mt-4'>
                      <Lucide.AlertCircle className='size-4' />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className='mt-4 grid gap-4'>
                    <Field>
                      <Label htmlFor='new-email'>New email address</Label>
                      <Input
                        id='new-email'
                        type='email'
                        value={newEmail}
                        onChange={(e) => {
                          setNewEmail(e.target.value)
                          if (error) setError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && password.trim() && !isSubmitting) {
                            handleSubmit()
                          }
                        }}
                        disabled={isSubmitting}
                        placeholder='new@email.com'
                        autoFocus
                      />
                    </Field>
                    <Field>
                      <Label htmlFor='change-email-password'>Current password</Label>
                      <InputPassword
                        id='change-email-password'
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (error) setError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newEmail.trim() && !isSubmitting) {
                            handleSubmit()
                          }
                        }}
                        disabled={isSubmitting}
                        placeholder='Your password'
                      />
                    </Field>
                  </div>
                </DialogBody>
                <DialogFooter>
                  <Button
                    variant='primary'
                    disabled={!newEmail.trim() || !password.trim() || isSubmitting}
                    onClick={handleSubmit}
                    block
                  >
                    {isSubmitting ? (
                      <span className='flex items-center justify-center gap-2'>
                        <Lucide.Loader2 className='size-4 animate-spin' />
                        Sending...
                      </span>
                    ) : (
                      'Send Verification'
                    )}
                  </Button>
                </DialogFooter>
              </Activity>

              <Activity mode={emailSent ? 'visible' : 'hidden'}>
                <DialogHeader>
                  <DialogClose className='ml-auto' onClick={handleCloseDialog}>
                    <Lucide.XIcon className='size-4' strokeWidth={2.0} />
                  </DialogClose>
                </DialogHeader>
                <DialogBody className='-mt-8'>
                  <div className='mb-4 flex flex-col items-center text-center'>
                    <div className='bg-background-primary-faded mb-3 flex size-14 items-center justify-center rounded-full'>
                      <Lucide.Mail className='text-foreground-primary size-7' />
                    </div>
                    <DialogTitle>Check Your New Email</DialogTitle>
                    <DialogDescription>
                      We've sent a verification link to {submittedEmail}
                    </DialogDescription>
                  </div>

                  <Alert variant='info'>
                    <AlertDescription className='text-sm'>
                      Check your inbox for a verification message. <br />
                      Click the link in that email to complete the email change. The link expires in{' '}
                      <strong>24 hours</strong>.
                    </AlertDescription>
                  </Alert>

                  <div className='my-5 space-y-4 text-center'>
                    <p className='text-on-background-neutral text-sm'>
                      Didn&apos;t receive the email?
                    </p>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={handleResendEmail}
                      disabled={isCooldown || isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className='flex items-center justify-center gap-1'>
                          <Lucide.Loader2 className='h-3 w-3 animate-spin' />
                          Resending...
                        </span>
                      ) : isCooldown ? (
                        `Resend in ${remainingSeconds}s`
                      ) : (
                        'Resend email'
                      )}
                    </Button>
                  </div>
                  {error && (
                    <Alert variant='danger'>
                      <Lucide.AlertCircle className='size-4' />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </DialogBody>
              </Activity>
            </DialogPopup>
          </Dialog>
        </CardHeaderAction>
      </CardHeader>
      <CardBody>
        <p className='text-on-background-neutral text-sm'>
          Your current email address is <strong>{currentEmail}</strong>
        </p>
      </CardBody>
    </Card>
  )
}
