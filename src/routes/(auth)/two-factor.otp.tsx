import { useAsyncRateLimiter } from '@tanstack/react-pacer'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { authClient } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'
import { getSafeRedirect } from '#/utils/redirect'

export const Route = createFileRoute('/(auth)/two-factor/otp')({
  component: RouteComponent,
  // beforeLoad: async () => {
  //   const session = await getSession()
  //   if (!session) {
  //     throw redirect({ to: '/signin' })
  //   }
  //   return { session }
  // },
  validateSearch: z.object({
    redirect: z.string().optional()
  })
})

const otpSchema = z.object({
  code: z.string().length(6, { error: 'Code must be 6 digits' }),
  trustDevice: z.boolean()
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  // Track initial OTP send time for resend cooldown
  const [initialSendTime, setInitialSendTime] = useState<number | null>(null)

  // Cooldown period: 10s for DEV, 60s for other environments
  const cooldownPeriod = import.meta.env.DEV ? 10000 : 60000

  const safeRedirect = getSafeRedirect(search.redirect)

  const form = useAppForm({
    defaultValues: { code: '', trustDevice: false },
    validators: { onChange: otpSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      setIsVerifying(true)

      try {
        const result = await authClient.twoFactor.verifyOtp({
          code: value.code,
          trustDevice: value.trustDevice
        })

        if (result.error) {
          setError(result.error.message || 'Invalid code')
          return
        }

        navigate({ to: safeRedirect })
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
      } finally {
        setIsVerifying(false)
      }
    }
  })

  const sendOtp = useCallback(async () => {
    try {
      const result = await authClient.twoFactor.sendOtp()
      if (result.error) {
        setError(result.error.message || 'Failed to send OTP')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to send OTP')
    }
  }, [])

  const resendLimiter = useAsyncRateLimiter(
    async () => {
      await sendOtp()
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

  // Send OTP on mount and start cooldown
  useEffect(() => {
    sendOtp()
    setInitialSendTime(Date.now())
  }, [sendOtp])

  // Force re-render for countdown
  const [, setTick] = useState(0)
  useEffect(() => {
    if (initialSendTime || (resendState.isExceeded && resendState.executionTimes.length > 0)) {
      const interval = setInterval(() => {
        setTick((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [initialSendTime, resendState.isExceeded, resendState.executionTimes.length])

  // Calculate resend cooldown
  const cooldownEnd =
    Math.max(initialSendTime ?? 0, resendState.executionTimes[0] ?? 0) + cooldownPeriod
  const remainingSeconds = Math.ceil((cooldownEnd - Date.now()) / 1000)
  const isCooldown = remainingSeconds > 0

  return (
    <div className='flex justify-center px-4 py-10'>
      <div className='w-full max-w-md p-6'>
        <h1 className='text-lg leading-none font-semibold tracking-tight'>Email Verification</h1>
        <p className='text-on-background-neutral mt-2 mb-6 text-sm'>
          We've sent a 6-digit code to your email address
        </p>

        {error && (
          <div className='border-border-critical bg-background-critical-faded mb-4 border-l-4 px-3 py-2.5'>
            <p className='text-foreground-critical text-sm'>{error}</p>
          </div>
        )}

        <form
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
              <div>
                <label
                  htmlFor={field.name}
                  className='text-foreground-neutral mb-1.5 block text-sm font-medium'
                >
                  Verification Code
                </label>
                <input
                  type='text'
                  inputMode='numeric'
                  maxLength={6}
                  autoComplete='one-time-code'
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  onBlur={field.handleBlur}
                  className='border-border-neutral focus:ring-border-primary mt-1 block w-full rounded-md border px-3 py-2 text-center text-2xl tracking-[0.5em] focus:ring-2 focus:outline-none'
                  placeholder='000000'
                />
              </div>
            )}
          </form.AppField>

          <form.AppField name='trustDevice'>
            {(field) => <field.CheckboxField label='Trust this device' />}
          </form.AppField>

          <form.AppForm>
            <form.SubmitButton label={isVerifying ? 'Verifying...' : 'Verify'} />
          </form.AppForm>
        </form>

        <div className='mt-6 text-center'>
          <button
            type='button'
            onClick={handleResend}
            disabled={isCooldown}
            className='text-foreground-primary text-sm font-medium transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isCooldown ? `Resend code in ${remainingSeconds}s` : 'Resend code'}
          </button>
        </div>

        <div className='mt-4 text-center'>
          <Link
            to='/two-factor'
            search={search.redirect ? { redirect: search.redirect } : undefined}
            className='text-foreground-primary text-sm font-medium transition-colors hover:underline'
          >
            Use authenticator app instead
          </Link>
        </div>
      </div>
    </div>
  )
}
