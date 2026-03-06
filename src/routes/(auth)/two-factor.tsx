import { useAsyncRateLimiter } from '@tanstack/react-pacer'
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { Activity, useCallback, useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { Alert } from '#/components/alert'
import { Button } from '#/components/button'
import { Card, CardBody, CardDescription, CardTitle } from '#/components/card'
import { CardFooter, CardHeader } from '#/components/card'
import { Field, FieldError, FieldLabel } from '#/components/field'
import { Form } from '#/components/form'
import { Input } from '#/components/input'
import { Link } from '#/components/link'
import { authClient } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'
import { getSafeRedirect } from '#/utils/redirect'
import { clx } from '#/utils/variant'

export const Route = createFileRoute('/(auth)/two-factor')({
  component: RouteComponent,
  validateSearch: z.object({
    redirect: z.string().optional()
  })
})

const totpSchema = z.object({
  code: z.string().length(6, { error: 'Code must be 6 digits' }),
  trustDevice: z.boolean()
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [method, setMethod] = useState<'totp' | 'email-otp'>('totp')

  // OTP-related states
  const [initialSendTime, setInitialSendTime] = useState<number | null>(null)
  const cooldownPeriod = import.meta.env.DEV ? 10000 : 60000

  const safeRedirect = getSafeRedirect(search.redirect)

  const form = useAppForm({
    defaultValues: { code: '', trustDevice: false },
    validators: { onChange: totpSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      setIsVerifying(true)

      try {
        const result =
          method === 'email-otp'
            ? await authClient.twoFactor.verifyOtp({ ...value })
            : await authClient.twoFactor.verifyTotp({ ...value })

        if (result.error) {
          const errorMessage = result.error.message || 'Invalid code'

          // Handle invalid two-factor cookie error
          if (
            errorMessage.toLowerCase().includes('cookie') ||
            errorMessage.toLowerCase().includes('invalid two factor')
          ) {
            // Clear the saved method as the session is invalid
            sessionStorage.removeItem('2fa-method')
            setMethod('totp')
            setError(
              'Your verification session has expired. Please start the sign-in process again.'
            )
            setIsVerifying(false)
            return
          }

          setError(errorMessage)
          return
        }

        navigate({ to: safeRedirect })
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
      } finally {
        setIsVerifying(false)
        setMethod('totp')
      }
    }
  })

  // Track if OTP has been sent for current method session
  const initialOtpSentRef = useRef(false)

  const sendOtp = useCallback(async () => {
    setOtpSent(false)
    try {
      const result = await authClient.twoFactor.sendOtp()
      if (result.error) {
        const errorMessage = result.error.message || 'Failed to send OTP'

        // Handle invalid two-factor cookie error
        if (
          errorMessage.toLowerCase().includes('cookie') ||
          errorMessage.toLowerCase().includes('invalid two factor')
        ) {
          sessionStorage.removeItem('2fa-method')
          sessionStorage.removeItem('2fa-otp-send-time')
          setMethod('totp')
          setError('Your verification session has expired. Please start the sign-in process again.')
          return result
        }

        setError(errorMessage)
      }
      setOtpSent(true)
      return result
    } catch (err) {
      console.error(err)
      setError('Failed to send OTP')
      return { error: { message: 'Failed to send OTP' } }
    }
  }, [])

  const resendLimiter = useAsyncRateLimiter(
    async () => {
      await sendOtp()
      // Update send time in sessionStorage on successful resend
      const now = Date.now()
      setInitialSendTime(now)
      sessionStorage.setItem('2fa-otp-send-time', now.toString())
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

  const handleResend = () => resendLimiter.maybeExecute()
  const resendState = resendLimiter.state

  // Initialize method from sessionStorage on mount
  useEffect(() => {
    const savedMethod = sessionStorage.getItem('2fa-method')
    if (savedMethod === 'totp' || savedMethod === 'email-otp') {
      setMethod(savedMethod)
    }

    // Restore OTP send time if exists
    const savedOtpSendTime = sessionStorage.getItem('2fa-otp-send-time')
    if (savedOtpSendTime) {
      const sendTime = parseInt(savedOtpSendTime, 10)
      const now = Date.now()
      const elapsed = now - sendTime

      // Only restore if within cooldown period (otherwise it's expired)
      if (elapsed < cooldownPeriod) {
        setInitialSendTime(sendTime)
        initialOtpSentRef.current = true
      } else {
        // Expired, clear from sessionStorage
        sessionStorage.removeItem('2fa-otp-send-time')
      }
    }
  }, [])

  // Handle method changes
  useEffect(() => {
    sessionStorage.setItem('2fa-method', method)

    // Only send OTP when explicitly switching to email method
    // AND no valid recent OTP send exists
    if (method === 'email-otp' && !initialOtpSentRef.current) {
      initialOtpSentRef.current = true
      sendOtp()
      const now = Date.now()
      setInitialSendTime(now)
      sessionStorage.setItem('2fa-otp-send-time', now.toString())
    }
    // Note: Don't reset initialOtpSentRef when switching to TOTP
    // This allows switching back to OTP without re-sending if still within cooldown
  }, [method, sendOtp])

  // Sync initialSendTime to sessionStorage
  useEffect(() => {
    if (initialSendTime) {
      sessionStorage.setItem('2fa-otp-send-time', initialSendTime.toString())
    }
  }, [initialSendTime])

  // Countdown timer for resend cooldown
  const [, setTick] = useState(0)
  useEffect(() => {
    if (
      method === 'email-otp' &&
      (initialSendTime || (resendState.isExceeded && resendState.executionTimes.length > 0))
    ) {
      const interval = setInterval(() => setTick((prev) => prev + 1), 1000)
      return () => clearInterval(interval)
    }
  }, [method, initialSendTime, resendState.isExceeded, resendState.executionTimes.length])

  // Calculate resend cooldown
  const cooldownEnd =
    Math.max(initialSendTime ?? 0, resendState.executionTimes[0] ?? 0) + cooldownPeriod
  const remainingSeconds = Math.ceil((cooldownEnd - Date.now()) / 1000)
  const isCooldown = remainingSeconds > 0

  // Clear sessionStorage when cooldown expires
  useEffect(() => {
    if (method === 'email-otp' && initialSendTime && !isCooldown) {
      sessionStorage.removeItem('2fa-otp-send-time')
      setInitialSendTime(null)
      initialOtpSentRef.current = false
    }
  }, [method, initialSendTime, isCooldown])

  return (
    <div className='w-full max-w-md space-y-6 p-8'>
      <Card className='w-full min-w-sm'>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription className='text-sm'>
            {method === 'email-otp'
              ? "We'll send a 6-digit code to your email address"
              : 'Enter the code from your authenticator app'}
          </CardDescription>
        </CardHeader>
        <CardBody>
          <Activity mode={method === 'email-otp' && otpSent ? 'visible' : 'hidden'}>
            <Alert variant='info' className='mb-4'>
              We've sent the OTP to your email.
            </Alert>
          </Activity>

          <Activity mode={error ? 'visible' : 'hidden'}>
            <Alert variant='danger' className='mb-4'>
              {error}
            </Alert>
          </Activity>

          <Form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className='grid gap-4'
          >
            <form.AppField
              name='code'
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.length !== 6) {
                    return 'Please enter a valid 6-digit code'
                  }
                  if (!/^\d+$/.test(value)) {
                    return 'Code must contain only numbers'
                  }
                  return undefined
                }
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Verification Code</FieldLabel>
                  <Input
                    id={field.name}
                    type='text'
                    inputMode='numeric'
                    maxLength={6}
                    autoComplete='one-time-code'
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    onBlur={field.handleBlur}
                    className='py-6 text-center text-2xl tracking-[0.5em]'
                    placeholder='000000'
                    autoFocus
                  />
                  <FieldError match={field.state.meta.errors.length > 0}>
                    {field.state.meta.errors
                      .map((error) => (typeof error === 'string' ? error : error?.message))
                      .join(', ')}
                  </FieldError>
                </Field>
              )}
            </form.AppField>

            <div className='flex items-center justify-between'>
              <form.AppField name='trustDevice'>
                {(field) => <field.CheckboxField label='Trust this device' />}
              </form.AppField>

              <Activity mode={method === 'email-otp' ? 'visible' : 'hidden'}>
                <div className='text-center'>
                  <button
                    type='button'
                    onClick={handleResend}
                    disabled={isCooldown}
                    className={clx(
                      'text-foreground-primary cursor-pointer p-0 text-sm transition-colors hover:font-medium',
                      'hover:underline disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                  >
                    {isCooldown ? `Resend code in ${remainingSeconds}s` : 'Resend code'}
                  </button>
                </div>
              </Activity>
            </div>

            <form.AppForm>
              <form.SubmitButton label={isVerifying ? 'Verifying...' : 'Verify'} />
            </form.AppForm>
          </Form>
        </CardBody>
        <CardFooter className='flex flex-col items-center justify-center gap-4 text-center'>
          <Button
            variant='ghost'
            onClick={() => setMethod(method === 'totp' ? 'email-otp' : 'totp')}
            block
          >
            {method === 'totp' ? 'Use email verification instead' : 'Use authenticator app instead'}
          </Button>
        </CardFooter>
      </Card>
      <div className='w-full min-w-sm text-center'>
        <Link render={<RouterLink to='/signin' />}>Back to Sign In</Link>
      </div>
    </div>
  )
}
