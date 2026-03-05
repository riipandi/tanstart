import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Activity, useEffect, useState } from 'react'
import { z } from 'zod'
import { Alert, AlertDescription } from '#/components/alert'
import { Button } from '#/components/button'
import { Card, CardBody, CardDescription, CardTitle } from '#/components/card'
import { CardFooter, CardHeader } from '#/components/card'
import { Form } from '#/components/form'
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

const signinSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z.string().min(1, { error: 'Password is required' }),
  rememberMe: z.boolean()
})

function RouteComponent() {
  const loaderData = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const { isPending } = authClient.useSession()
  const [error, setError] = useState<string | null>(null)

  const [step, setStep] = useState<'init' | 'selector'>('init')
  const [signinMethod, setSigninMethod] = useState<'password' | 'magic-link'>('password')

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

  const form = useAppForm({
    defaultValues: { email: '', password: '', rememberMe: false },
    validators: { onChangeAsync: signinSchema },
    onSubmit: async ({ value, formApi }) => {
      setError(null)
      try {
        const result = await authClient.signIn.email({ ...value })

        if (result.error) {
          setError(result.error.message || 'Sign in failed')
          return formApi.resetField('password')
        }

        return result.data.url
          ? navigate({ href: result.data.url })
          : navigate({ to: search.redirect || '/dashboard' })
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
      }
    }
  })

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
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
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardBody>
          <Activity mode={error ? 'visible' : 'hidden'}>
            <div className='mb-6'>{error ? <Alert variant='danger'>{error}</Alert> : null}</div>
          </Activity>

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
              block
            >
              <Lucide.Key className='size-4' />
              Sign in with Passkey
            </Button>
          </div>

          <Separator className='my-8' contentSide='center'>
            Or, continue with
          </Separator>

          <Form onSubmit={handleSubmit} className='-mt-2 grid gap-4'>
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
              {(field) => <field.TextField label='Email address' autoComplete='email webauthn' />}
            </form.AppField>

            <Activity
              mode={step === 'selector' && signinMethod === 'password' ? 'visible' : 'hidden'}
            >
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
                    autoFocus={step === 'selector'}
                  />
                )}
              </form.AppField>

              <div className='flex items-center justify-between'>
                <form.AppField name='rememberMe'>
                  {(field) => <field.CheckboxField label='Remember me' />}
                </form.AppField>

                <Link render={<RouterLink to='/forgot-password' />}>Forgot password?</Link>
              </div>
            </Activity>

            <Activity mode={step === 'init' ? 'visible' : 'hidden'}>
              <Button
                type='button'
                block
                onClick={() => {
                  setSigninMethod('password')
                  setStep('selector')
                }}
              >
                Continue
              </Button>
            </Activity>

            <Activity mode={step === 'selector' ? 'visible' : 'hidden'}>
              <form.AppForm>
                <form.SubmitButton label='Sign in' />
              </form.AppForm>
              <Button
                type='button'
                variant='ghost'
                onClick={() => {
                  setSigninMethod('password')
                  setStep('selector')
                }}
              >
                Continue with Magic Link
              </Button>
            </Activity>
          </Form>
        </CardBody>
        <CardFooter className='debug w-full items-center justify-center text-center'>
          <Activity mode={loaderData.disableSignUp ? 'hidden' : 'visible'}>
            <Link render={<RouterLink to='/signup' />}>Don't have an account? Sign up</Link>
          </Activity>
        </CardFooter>
      </Card>
    </div>
  )
}
