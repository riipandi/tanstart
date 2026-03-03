import { useAsyncRateLimiter } from '@tanstack/react-pacer'
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { Alert } from '#/components/alert'
import { Button } from '#/components/button'
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '#/components/card'
import { Field, FieldError, FieldLabel } from '#/components/field'
import { Form } from '#/components/form'
import { Input } from '#/components/input'
import { authClient } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'
import { getSafeRedirect } from '#/utils/redirect'
import { clx } from '#/utils/variant'

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
        const result = await authClient.twoFactor.verifyOtp({ ...value })

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
    <div className='w-full max-w-md space-y-6 p-8'>
      <Card className='w-full min-w-sm'>
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription className='text-sm'>
            We've sent a 6-digit code to your email address
          </CardDescription>
        </CardHeader>
        <CardBody>
          {error ? <div className='mb-6'>{<Alert variant='danger'>{error}</Alert>}</div> : null}

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
                    className='text-center text-2xl tracking-[0.5em]'
                    placeholder='000000'
                  />
                  <FieldError match={field.state.meta.errors.length > 0}>
                    {field.state.meta.errors
                      .map((error) => (typeof error === 'string' ? error : error?.message))
                      .join(', ')}
                  </FieldError>
                </Field>
              )}
            </form.AppField>

            <div className='flex flex-1 items-center justify-between'>
              <form.AppField name='trustDevice'>
                {(field) => <field.CheckboxField label='Trust this device' />}
              </form.AppField>
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

            <form.AppForm>
              <form.SubmitButton label={isVerifying ? 'Verifying...' : 'Verify'} />
            </form.AppForm>
          </Form>
        </CardBody>
        <CardFooter className='flex flex-col items-center justify-center gap-4 text-center'>
          <Button
            block
            variant='ghost'
            render={
              <RouterLink
                to='/two-factor'
                search={search.redirect ? { redirect: search.redirect } : undefined}
              />
            }
          >
            Use authenticator app instead
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
