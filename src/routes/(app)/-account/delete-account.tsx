import * as Lucide from 'lucide-react'
import { Activity, useEffect, useState } from 'react'
import { authClient } from '#/guards/auth-client'

export function DeleteAccount() {
  // Dialog visibility
  const [showDialog, setShowDialog] = useState(false)

  // Form state
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Success state
  const [emailSent, setEmailSent] = useState(false)

  // Resend timer
  const [resendTimer, setResendTimer] = useState(0)
  const [canResend, setCanResend] = useState(true)

  // Handle resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (resendTimer === 0 && !canResend) {
      setCanResend(true)
    }
  }, [resendTimer, canResend])

  const handleOpenDialog = () => {
    setShowDialog(true)
    setError(null)
    setPassword('')
    setEmailSent(false)
    setResendTimer(0)
    setCanResend(true)
  }

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
      setIsSubmitting(false)
      // Start resend timer
      setResendTimer(60)
      setCanResend(false)
    } catch (err) {
      console.error('Delete account error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleResendEmail = async () => {
    if (!canResend || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Re-submit with same password (user already verified password in previous step)
      const result = await authClient.deleteUser({
        password: password.trim(),
        callbackURL: '/signin'
      })

      if (result.error) {
        setError(result.error.message || 'Failed to resend email')
        setIsSubmitting(false)
        return
      }

      // Reset timer
      setResendTimer(60)
      setCanResend(false)
      setIsSubmitting(false)
    } catch (err) {
      console.error('Resend email error:', err)
      setError('Failed to resend email. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleGotIt = () => {
    handleCloseDialog()
  }

  return (
    <div className='border-border-critical-faded bg-background-critical-faded/50 rounded-lg border p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-foreground-critical text-base font-semibold'>Delete Account</h2>
          <p className='text-on-background-neutral mt-1 text-sm'>
            Permanently delete your account and all associated data
          </p>
        </div>
      </div>

      <div className='mt-6'>
        <div className='border-border-warning bg-background-warning-faded rounded-md border-l-4 p-4'>
          <div className='flex items-start gap-3'>
            <Lucide.AlertTriangle className='text-foreground-warning mt-0.5 h-5 w-5' />
            <div>
              <p className='text-foreground-warning font-medium'>
                Warning: This action cannot be undone
              </p>
              <p className='text-foreground-warning mt-1 text-sm'>
                Deleting your account will permanently remove all your data, including your profile,
                linked social accounts, active sessions, and two-factor authentication settings.
              </p>
            </div>
          </div>
        </div>

        <div className='mt-4'>
          <button
            type='button'
            onClick={handleOpenDialog}
            className='bg-background-critical hover:bg-background-critical/80 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50'
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Activity mode={showDialog ? 'visible' : 'hidden'}>
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
          role='dialog'
          aria-modal='true'
          aria-labelledby='delete-dialog-title'
        >
          <div className='bg-background-page shadow-raised w-full max-w-md overflow-hidden rounded-lg'>
            {/* Step 1: Password Form */}
            <Activity mode={!emailSent ? 'visible' : 'hidden'}>
              <div className='p-6'>
                {/* Header */}
                <div className='mb-6 flex items-center gap-3'>
                  <div className='bg-background-critical/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                    <Lucide.AlertTriangle className='text-foreground-critical h-5 w-5' />
                  </div>
                  <div>
                    <h3
                      id='delete-dialog-title'
                      className='text-foreground-neutral text-lg font-semibold'
                    >
                      Delete Account?
                    </h3>
                    <p className='text-on-background-neutral text-sm'>
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className='text-on-background-neutral mb-6 text-sm'>
                  To confirm deletion, please enter your password. We&apos;ll send you an email with
                  a confirmation link to complete this process.
                </p>

                {/* Error Message */}
                <Activity mode={error ? 'visible' : 'hidden'}>
                  <div className='border-border-critical bg-background-critical-faded mb-4 flex items-start gap-2 rounded-md border-l-4 p-3'>
                    <Lucide.AlertCircle className='text-foreground-critical mt-0.5 h-4 w-4 shrink-0' />
                    <p className='text-foreground-critical text-sm'>{error}</p>
                  </div>
                </Activity>

                {/* Password Input */}
                <div className='mb-6'>
                  <label
                    htmlFor='delete-password'
                    className='text-foreground-neutral mb-1.5 block text-sm font-medium'
                  >
                    Enter your password
                  </label>
                  <input
                    id='delete-password'
                    type='password'
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
                    className='border-border-neutral focus:border-foreground-primary focus:ring-foreground-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50'
                    placeholder='Your password'
                  />
                </div>

                {/* Actions */}
                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={handleCloseDialog}
                    disabled={isSubmitting}
                    className='border-border-neutral hover:bg-background-neutral-faded text-foreground-neutral hover:text-foreground-neutral flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50'
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    onClick={handleSubmit}
                    disabled={!password.trim() || isSubmitting}
                    className='bg-background-critical hover:bg-background-critical/80 focus-visible:bg-background-critical/90 text-on-background-critical focus-visible:ring-foreground-critical flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {isSubmitting ? (
                      <span className='flex items-center justify-center gap-2'>
                        <Lucide.Loader2 className='h-4 w-4 animate-spin' />
                        Sending...
                      </span>
                    ) : (
                      'Delete Account'
                    )}
                  </button>
                </div>
              </div>
            </Activity>

            {/* Step 2: Email Sent */}
            <Activity mode={emailSent ? 'visible' : 'hidden'}>
              <div className='p-6'>
                {/* Header */}
                <div className='mb-6 flex flex-col items-center text-center'>
                  <div className='bg-background-primary-faded mb-3 flex h-14 w-14 items-center justify-center rounded-full'>
                    <Lucide.Mail className='text-foreground-primary h-7 w-7' />
                  </div>
                  <h3 className='text-foreground-neutral text-lg font-semibold'>
                    Check Your Email
                  </h3>
                  <p className='text-on-background-neutral mt-1 text-sm'>
                    We&apos;ve sent a confirmation link to your email
                  </p>
                </div>

                {/* Description */}
                <div className='border-border-neutral bg-background-neutral-faded mb-6 rounded-md border p-4'>
                  <p className='text-on-background-neutral text-sm'>
                    Please check your inbox and click the confirmation link to complete the account
                    deletion.
                  </p>
                  <p className='text-on-background-neutral mt-2 text-sm'>
                    <strong>Important:</strong> This link will expire in 1 hour.
                  </p>
                </div>

                {/* Resend Section */}
                <div className='mb-6 text-center'>
                  <p className='text-on-background-neutral text-sm'>
                    Didn&apos;t receive the email?
                  </p>
                  <button
                    type='button'
                    onClick={handleResendEmail}
                    disabled={!canResend || isSubmitting}
                    className='text-foreground-primary hover:text-foreground-primary/80 disabled:text-foreground-disabled disabled:hover:text-foreground-disabled mt-1 text-sm font-medium transition-colors disabled:cursor-not-allowed'
                  >
                    {isSubmitting ? (
                      <span className='flex items-center justify-center gap-1'>
                        <Lucide.Loader2 className='h-3 w-3 animate-spin' />
                        Resending...
                      </span>
                    ) : canResend ? (
                      'Resend email'
                    ) : (
                      `Resend in ${resendTimer}s`
                    )}
                  </button>
                </div>

                {/* Error on resend */}
                <Activity mode={error && emailSent ? 'visible' : 'hidden'}>
                  <div className='border-border-critical bg-background-critical-faded mb-4 flex items-start gap-2 rounded-md border-l-4 p-3'>
                    <Lucide.AlertCircle className='text-foreground-critical mt-0.5 h-4 w-4 shrink-0' />
                    <p className='text-foreground-critical text-sm'>{error}</p>
                  </div>
                </Activity>

                {/* Action */}
                <button
                  type='button'
                  onClick={handleGotIt}
                  className='bg-foreground-primary hover:bg-foreground-primary/80 focus-visible:bg-foreground-primary/90 text-on-background-primary focus-visible:ring-foreground-primary w-full rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                >
                  Got it
                </button>
              </div>
            </Activity>
          </div>
        </div>
      </Activity>
    </div>
  )
}
