import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { authClient } from '#/guards/auth-client'
import { getSession } from '#/guards/session'
import { useAppForm } from '#/hooks/use-form'

export const Route = createFileRoute('/(auth)/two-factor/otp')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/signin' })
    }
    return { session }
  }
})

const otpSchema = z.object({
  code: z.string().length(6, { error: 'Code must be 6 digits' }),
  trustDevice: z.boolean()
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

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

        navigate({ to: '/dashboard' })
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
      } finally {
        setIsVerifying(false)
      }
    }
  })

  const sendOtp = async () => {
    try {
      const result = await authClient.twoFactor.sendOtp()
      if (result.error) {
        setError(result.error.message || 'Failed to send OTP')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to send OTP')
    }
  }

  useEffect(() => {
    sendOtp()

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleResend = () => {
    if (resendCountdown > 0) return

    setResendCountdown(60)
    sendOtp()

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

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
            disabled={resendCountdown > 0}
            className='text-foreground-primary text-sm font-medium transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50'
          >
            {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend code'}
          </button>
        </div>

        <div className='mt-4 text-center'>
          <Link
            to='/two-factor'
            className='text-foreground-primary text-sm font-medium transition-colors hover:underline'
          >
            Use authenticator app instead
          </Link>
        </div>
      </div>
    </div>
  )
}
