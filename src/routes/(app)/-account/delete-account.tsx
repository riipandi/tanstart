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
import { InputPassword } from '#/components/input-password'
import { Label } from '#/components/label'
import { authClient } from '#/guards/auth-client'

export function DeleteAccount() {
  const [showDialog, setShowDialog] = useState(false)
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  // Track initial submit time for resend cooldown
  const [initialSubmitTime, setInitialSubmitTime] = useState<number | null>(null)

  // Cooldown period: 10s for DEV, 60s for other environments
  const cooldownPeriod = import.meta.env.DEV ? 10_000 : 60_000

  const handleCloseDialog = () => {
    if (!isSubmitting) {
      setShowDialog(false)
      // Reset after animation
      setTimeout(() => {
        setError(null)
        setPassword('')
        setEmailSent(false)
      }, 300)
    }
  }

  const handleSubmit = async () => {
    if (!password.trim()) {
      setError('Password is required to delete your account')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await authClient.deleteUser({
        password: password.trim(),
        callbackURL: '/signin'
      })

      if (result.error) {
        // Handle specific error cases
        if (result.error.message?.toLowerCase().includes('password')) {
          setError('Incorrect password. Please try again.')
        } else {
          setError(result.error.message || 'Failed to initiate account deletion')
        }
        setIsSubmitting(false)
        return
      }

      // Success - show email sent state
      setEmailSent(true)
      setInitialSubmitTime(Date.now())
      setIsSubmitting(false)
    } catch (err) {
      console.error('Delete account error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const resendLimiter = useAsyncRateLimiter(
    async () => {
      setIsSubmitting(true)
      setError(null)

      try {
        const result = await authClient.deleteUser({
          password: password.trim(),
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

  // Force re-render for countdown
  const [, setTick] = useState(0)
  useEffect(() => {
    if (initialSubmitTime || (resendState.isExceeded && resendState.executionTimes.length > 0)) {
      const interval = setInterval(() => {
        setTick((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [initialSubmitTime, resendState.isExceeded, resendState.executionTimes.length])

  // Calculate resend cooldown
  const cooldownEnd =
    Math.max(initialSubmitTime ?? 0, resendState.executionTimes[0] ?? 0) + cooldownPeriod
  const remainingSeconds = Math.ceil((cooldownEnd - Date.now()) / 1000)
  const isCooldown = remainingSeconds > 0

  return (
    <Card className='bg-background-critical-faded'>
      <CardHeader>
        <CardTitle className='text-foreground-critical'>Delete Account</CardTitle>
        <CardDescription>Permanently delete your account</CardDescription>
        <CardHeaderAction>
          <Dialog open={showDialog} onOpenChange={setShowDialog} disablePointerDismissal>
            <DialogTrigger render={<Button type='button' variant='danger' />}>
              Delete Account
            </DialogTrigger>
            <DialogPopup>
              {/* Step 1: Password Form */}
              <Activity mode={!emailSent ? 'visible' : 'hidden'}>
                <DialogHeader>
                  <div className='flex items-center gap-3'>
                    <div className='bg-background-critical/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                      <Lucide.AlertTriangle className='text-foreground-critical h-5 w-5' />
                    </div>
                    <div>
                      <DialogTitle>Delete Account?</DialogTitle>
                      <DialogDescription>This action cannot be undone</DialogDescription>
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
                    To confirm deletion, please enter your password. We&apos;ll send you an email
                    with a confirmation link to complete this process.
                  </p>
                  {error && (
                    <Alert variant='danger' className='mt-4'>
                      <Lucide.AlertCircle className='size-4' />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Field className='mt-4'>
                    <Label htmlFor='delete-password'>Enter your password</Label>
                    <InputPassword
                      id='delete-password'
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (error) setError(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && password.trim() && !isSubmitting) {
                          handleSubmit()
                        }
                      }}
                      disabled={isSubmitting}
                      placeholder='Your password'
                      autoFocus
                    />
                  </Field>
                </DialogBody>
                <DialogFooter>
                  <Button
                    variant='danger'
                    disabled={!password.trim() || isSubmitting}
                    onClick={handleSubmit}
                    block
                  >
                    {isSubmitting ? (
                      <span className='flex items-center justify-center gap-2'>
                        <Lucide.Loader2 className='size-4 animate-spin' />
                        Sending...
                      </span>
                    ) : (
                      'Delete Account'
                    )}
                  </Button>
                </DialogFooter>
              </Activity>

              {/* Step 2: Email Sent */}
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
                    <DialogTitle>Check Your Email</DialogTitle>
                    <DialogDescription>
                      We've sent a confirmation link to your email.
                    </DialogDescription>
                  </div>

                  <Alert variant='info'>
                    <AlertDescription className='text-sm'>
                      Check your email inbox for a confirmation message. <br />
                      Click the link in that email to complete your account deletion. The link
                      expires in <strong>1 hour</strong>.
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
        <Alert variant='danger'>
          <Lucide.AlertTriangle className='size-6' />
          <AlertDescription className='my-1 px-2'>
            <strong>Warning: This action cannot be undone</strong>
            <br />
            Deleting your account will permanently remove all your data, including your profile,
            linked social accounts, active sessions, and two-factor authentication settings.
          </AlertDescription>
        </Alert>
      </CardBody>
    </Card>
  )
}
