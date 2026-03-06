import { useAsyncRateLimiter } from '@tanstack/react-pacer'
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Activity, useCallback, useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { Alert, AlertDescription } from '#/components/alert'
import { Button } from '#/components/button'
import { Card, CardBody, CardDescription, CardTitle } from '#/components/card'
import { CardFooter, CardHeader } from '#/components/card'
import { Field, FieldError, FieldLabel } from '#/components/field'
import { Form } from '#/components/form'
import { Input } from '#/components/input'
import { Link } from '#/components/link'
import { Separator } from '#/components/separator'
import { publicEnv } from '#/config'
import { authClient } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'
import { SignInWithSocialProvider } from './-social-buttons'

export const Route = createFileRoute('/(auth)/signin')({
  component: RouteComponent,
  loader: () => {
    return { disableSignUp: publicEnv.PUBLIC_DISABLE_SIGNUP }
  },
  validateSearch: z.object({
    logout: z.union([z.string(), z.boolean()]).optional(),
    account_deleted: z.union([z.string(), z.boolean()]).optional(),
    redirect: z.string().optional()
  })
})

const STORAGE_KEYS = {
  email: 'signin-email',
  method: 'signin-method',
  step: 'signin-step',
  magicLinkSendTime: 'signin-magic-link-send-time'
} as const

const MAGIC_LINK_COOLDOWN = import.meta.env.DEV ? 10000 : 60000

type SigninMethod = 'password' | 'magic-link'
type SigninStep = 'init' | 'auth'

const signinSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z.string().min(1, { error: 'Password is required' }),
  rememberMe: z.boolean()
})

const passwordOnlySchema = signinSchema

function RouteComponent() {
  const loaderData = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const { isPending } = authClient.useSession()

  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [step, setStep] = useState<SigninStep>('init')
  const [signinMethod, setSigninMethod] = useState<SigninMethod>('password')
  const [emailValue, setEmailValue] = useState('')
  const [magicLinkSendTime, setMagicLinkSendTime] = useState<number | null>(null)
  const initialMagicLinkSentRef = useRef(false)

  const form = useAppForm({
    defaultValues: { email: '', password: '', rememberMe: false },
    validators: { onChange: passwordOnlySchema },
    onSubmit: async ({ value }) => {
      if (signinMethod === 'magic-link') {
        return
      }

      setError(null)
      setIsSubmitting(true)

      try {
        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password || '',
          callbackURL: search.redirect || '/dashboard'
        })

        if (result.error) {
          setError(result.error.message || 'Sign in failed')
          return
        }

        sessionStorage.removeItem(STORAGE_KEYS.step)
        sessionStorage.removeItem(STORAGE_KEYS.method)
        sessionStorage.removeItem(STORAGE_KEYS.email)

        return result.data.url
          ? navigate({ href: result.data.url })
          : navigate({ to: search.redirect || '/dashboard' })
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
      } finally {
        setIsSubmitting(false)
      }
    }
  })

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const savedStep = sessionStorage.getItem(STORAGE_KEYS.step) as SigninStep | null
    const savedMethod = sessionStorage.getItem(STORAGE_KEYS.method) as SigninMethod | null
    const savedEmail = sessionStorage.getItem(STORAGE_KEYS.email)

    if (savedStep === 'auth' && savedEmail) {
      setStep('auth')
      setSigninMethod(savedMethod === 'magic-link' ? 'magic-link' : 'password')
      setEmailValue(savedEmail)
      form.setFieldValue('email', savedEmail)

      // Restore magic link send time if exists
      const savedMagicLinkSendTime = sessionStorage.getItem(STORAGE_KEYS.magicLinkSendTime)
      if (savedMagicLinkSendTime) {
        const sendTime = parseInt(savedMagicLinkSendTime, 10)
        const now = Date.now()
        const elapsed = now - sendTime

        if (elapsed < MAGIC_LINK_COOLDOWN) {
          setMagicLinkSendTime(sendTime)
          initialMagicLinkSentRef.current = true
        } else {
          sessionStorage.removeItem(STORAGE_KEYS.magicLinkSendTime)
        }
      }
    }
  }, [])

  // Persist state to sessionStorage on change
  useEffect(() => {
    if (step === 'init') {
      sessionStorage.removeItem(STORAGE_KEYS.step)
      sessionStorage.removeItem(STORAGE_KEYS.method)
      sessionStorage.removeItem(STORAGE_KEYS.email)
    } else {
      sessionStorage.setItem(STORAGE_KEYS.step, step)
      sessionStorage.setItem(STORAGE_KEYS.method, signinMethod)
      sessionStorage.setItem(STORAGE_KEYS.email, emailValue)
    }
  }, [step, signinMethod, emailValue])

  useEffect(() => {
    if (
      typeof PublicKeyCredential === 'undefined' ||
      !PublicKeyCredential.isConditionalMediationAvailable ||
      !PublicKeyCredential.isConditionalMediationAvailable()
    ) {
      return
    }

    authClient.signIn.passkey({
      autoFill: true,
      fetchOptions: {
        onSuccess: () => {
          window.location.href = search.redirect || '/dashboard'
        }
      }
    })
  }, [])

  // Handle magic link sign in
  const handleMagicLinkSignIn = useCallback(async () => {
    const email = form.getFieldValue('email')
    if (!email) {
      setError('Email is required')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: search.redirect || '/dashboard'
      })

      if (result.error) {
        setError(result.error.message || 'Failed to send magic link')
        return
      }

      setMagicLinkSent(true)
      sessionStorage.removeItem(STORAGE_KEYS.step)
      sessionStorage.removeItem(STORAGE_KEYS.method)
      sessionStorage.removeItem(STORAGE_KEYS.email)
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }, [form, search.redirect])

  // Resend rate limiter
  const resendLimiter = useAsyncRateLimiter(
    async () => {
      await handleMagicLinkSignIn()
      const now = Date.now()
      setMagicLinkSendTime(now)
      sessionStorage.setItem(STORAGE_KEYS.magicLinkSendTime, now.toString())
    },
    {
      limit: 1,
      window: MAGIC_LINK_COOLDOWN,
      windowType: 'sliding'
    },
    (state) => ({
      isExceeded: state.isExceeded,
      executionTimes: state.executionTimes
    })
  )

  // Countdown timer for magic link resend
  const [, setTick] = useState(0)
  useEffect(() => {
    if (magicLinkSendTime) {
      const interval = setInterval(() => setTick((prev) => prev + 1), 1000)
      return () => clearInterval(interval)
    }
  }, [magicLinkSendTime])

  const cooldownEnd =
    Math.max(magicLinkSendTime ?? 0, resendLimiter.state.executionTimes[0] ?? 0) +
    MAGIC_LINK_COOLDOWN
  const remainingSeconds = Math.ceil((cooldownEnd - Date.now()) / 1000)
  const isCooldown = remainingSeconds > 0

  // Clear when cooldown expires
  useEffect(() => {
    if (magicLinkSendTime && !isCooldown) {
      sessionStorage.removeItem(STORAGE_KEYS.magicLinkSendTime)
      setMagicLinkSendTime(null)
      initialMagicLinkSentRef.current = false
    }
  }, [magicLinkSendTime, isCooldown])

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const email = form.getFieldValue('email')
    if (!email) {
      setError('Email is required')
      return
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setError(null)
    setEmailValue(email)
    setStep('auth')
  }

  // Track email changes
  useEffect(() => {
    const email = form.getFieldValue('email')
    if (email) {
      setEmailValue(email)
    }
  }, [form])

  const handleBack = () => {
    setStep('init')
    setMagicLinkSent(false)
    setError(null)
  }

  const handleSwitchMethod = (method: SigninMethod) => {
    setSigninMethod(method)
    setMagicLinkSent(false)
    setError(null)

    if (method === 'magic-link' && !initialMagicLinkSentRef.current) {
      initialMagicLinkSentRef.current = true
      handleMagicLinkSignIn()
      const now = Date.now()
      setMagicLinkSendTime(now)
      sessionStorage.setItem(STORAGE_KEYS.magicLinkSendTime, now.toString())
    }
  }

  if (isPending) {
    return (
      <div className='flex items-center justify-center py-10'>
        <div className='border-border-neutral-faded border-t-foreground-neutral h-5 w-5 animate-spin rounded-full border-2' />
      </div>
    )
  }

  return (
    <div className='w-full max-w-md space-y-6 p-8'>
      <Activity mode={search.account_deleted ? 'visible' : 'hidden'}>
        <Alert variant='success'>
          <Lucide.Check className='size-4' />
          <AlertDescription>
            <strong>Your account has been removed.</strong> <br />
            All associated data has been removed and cannot be recovered.
          </AlertDescription>
        </Alert>
      </Activity>

      <Card className='w-full min-w-sm'>
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription className='text-sm'>
            {step === 'init'
              ? 'Enter your email to get started'
              : `Sign in to ${form.getFieldValue('email')}`}
          </CardDescription>
        </CardHeader>

        <CardBody>
          <Activity mode={error ? 'visible' : 'hidden'}>
            <div className='mb-6'>{error ? <Alert variant='danger'>{error}</Alert> : null}</div>
          </Activity>

          <Activity mode={signinMethod === 'magic-link' ? 'visible' : 'hidden'}>
            <Alert variant='info' className='mb-4'>
              <Lucide.Mail className='size-4' />
              <AlertDescription>
                We&apos;ve sent a magic link to {emailValue}. Click the link in your inbox to sign
                in.
              </AlertDescription>
            </Alert>
          </Activity>

          <Activity mode={signinMethod === 'magic-link' ? 'visible' : 'hidden'}>
            <div className='flex items-center justify-between'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => resendLimiter.maybeExecute()}
                disabled={isCooldown || isSubmitting}
              >
                {isCooldown ? `Resend in ${remainingSeconds}s` : 'Resend magic link'}
              </Button>

              <Button type='button' variant='ghost' onClick={handleBack}>
                Change email
              </Button>
            </div>
          </Activity>

          <Activity mode={magicLinkSent ? 'hidden' : 'visible'}>
            <Activity mode={step === 'init' ? 'visible' : 'hidden'}>
              <div className='flex flex-col gap-4'>
                <SignInWithSocialProvider
                  authClient={authClient}
                  callbackURL={search.redirect || '/dashboard'}
                />

                <Button
                  variant='outline'
                  onClick={async () => {
                    const originalError = console.error
                    try {
                      console.error = () => {}
                      await authClient.signIn.passkey({
                        autoFill: true,
                        fetchOptions: {
                          onSuccess: () => {
                            window.location.href = search.redirect || '/dashboard'
                          }
                        }
                      })
                    } catch (err: unknown) {
                      const errorObj = err as { code?: string; name?: string }
                      const errorCode = errorObj?.code || ''
                      const errorName = errorObj?.name || ''
                      if (
                        errorCode.includes('ABORT') ||
                        errorCode.includes('AbortError') ||
                        errorName.includes('AbortError')
                      ) {
                        console.error = originalError
                        return
                      }
                      console.error = originalError
                      setError('Passkey sign-in failed. Please try again.')
                    } finally {
                      console.error = originalError
                    }
                  }}
                  hidden // FIXME: Temporary disabled because of issue: `TypeError: Reflect.getMetadata is not a function`
                  block
                >
                  <Lucide.Key className='size-4' />
                  Sign in with Passkey
                </Button>
              </div>

              <Separator className='mt-8 mb-6' contentSide='center'>
                Or, continue with
              </Separator>
            </Activity>

            <Activity mode={step === 'init' ? 'visible' : 'hidden'}>
              <Form onSubmit={handleEmailSubmit} className='grid gap-4'>
                <form.AppField
                  name='email'
                  validators={{
                    onBlur: ({ value }) => {
                      if (!value || value.trim().length === 0) {
                        return 'Email is required'
                      }
                      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                        return 'Invalid email address'
                      }
                      return undefined
                    }
                  }}
                >
                  {(field) => (
                    <field.TextField label='Email address' autoComplete='email webauthn' />
                  )}
                </form.AppField>

                <Button type='submit' block>
                  Continue
                </Button>
              </Form>
            </Activity>

            <Activity mode={step === 'auth' ? 'visible' : 'hidden'}>
              <Form
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}
                className='grid gap-4'
              >
                <Activity mode={signinMethod === 'password' ? 'visible' : 'hidden'}>
                  <form.AppField
                    name='email'
                    validators={{
                      onBlur: ({ value }) => {
                        if (!value || value.trim().length === 0) {
                          return 'Email is required'
                        }
                        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                          return 'Invalid email address'
                        }
                        return undefined
                      }
                    }}
                  >
                    {(field) => (
                      <Field>
                        <div className='flex items-center justify-between'>
                          <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                          <Link onClick={handleBack}>Change</Link>
                        </div>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          autoComplete='email webauthn'
                          disabled
                        />
                        <FieldError match={field.state.meta.isTouched}>
                          {field.store.state.meta.errors
                            .map((error) => (typeof error === 'string' ? error : error?.message))
                            .join(', ')}
                        </FieldError>
                      </Field>
                    )}
                  </form.AppField>

                  <form.AppField
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
                    {(field) => (
                      <field.PasswordField
                        label='Password'
                        autoComplete='current-password webauthn'
                        autoFocus={step === 'auth'}
                      />
                    )}
                  </form.AppField>

                  <div className='flex items-center justify-between'>
                    <form.AppField name='rememberMe'>
                      {(field) => <field.CheckboxField label='Remember me' />}
                    </form.AppField>

                    <Link render={<RouterLink to='/forgot-password' />}>Forgot password?</Link>
                  </div>

                  <form.AppForm>
                    <form.SubmitButton label={isSubmitting ? 'Signing in...' : 'Sign in'} />
                  </form.AppForm>
                </Activity>
              </Form>

              <div className='mt-4 grid gap-2'>
                <Activity mode={signinMethod === 'password' ? 'visible' : 'hidden'}>
                  <Button
                    type='button'
                    variant='ghost'
                    onClick={() => handleSwitchMethod('magic-link')}
                    block
                  >
                    <Lucide.Link className='size-4' />
                    Sign in with Magic Link instead
                  </Button>
                </Activity>
              </div>
            </Activity>
          </Activity>
        </CardBody>

        <CardFooter className='debug w-full items-center justify-center text-center'>
          <Activity
            mode={loaderData.disableSignUp || signinMethod === 'magic-link' ? 'hidden' : 'visible'}
          >
            <Link render={<RouterLink to='/signup' />}>Don't have an account? Sign up</Link>
          </Activity>

          <Activity mode={signinMethod === 'magic-link' ? 'visible' : 'hidden'}>
            <Button
              type='button'
              variant='ghost'
              onClick={() => handleSwitchMethod('password')}
              block
            >
              <Lucide.Key className='size-4' />
              Sign in with Password instead
            </Button>
          </Activity>
        </CardFooter>
      </Card>
    </div>
  )
}
