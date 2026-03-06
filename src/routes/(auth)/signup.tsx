import { createFileRoute, Link as RouterLink, notFound } from '@tanstack/react-router'
import { Activity, useState } from 'react'
import { z } from 'zod'
import { Alert } from '#/components/alert'
import { Card, CardBody, CardDescription, CardTitle } from '#/components/card'
import { CardFooter, CardHeader } from '#/components/card'
import { Form } from '#/components/form'
import { Link } from '#/components/link'
import { Separator } from '#/components/separator'
import { publicEnv } from '#/config'
import { authClient } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'
import { SignInWithSocialProvider } from './-social-buttons'

export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent,
  beforeLoad: () => {
    if (publicEnv.PUBLIC_DISABLE_SIGNUP) {
      throw notFound()
    }
  },
  validateSearch: z.object({
    redirect: z.string().optional()
  })
})

const signupSchema = z
  .object({
    firstName: z.string().min(1, { error: 'First name is required' }),
    lastName: z.string().min(1, { error: 'Last name is required' }),
    email: z.email({ error: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { error: 'Password must be at least 8 characters' })
      .regex(/[a-zA-Z]/, { error: 'Password must contain at least 1 letter' })
      .regex(/[0-9]/, { error: 'Password must contain at least 1 number' })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        error: 'Password must contain at least 1 special character'
      }),
    confirmPassword: z.string().min(1, { error: 'Please confirm your password' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

function RouteComponent() {
  const search = Route.useSearch()
  const { isPending } = authClient.useSession()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
    validators: { onChangeAsync: signupSchema },
    onSubmit: async ({ value, formApi }) => {
      setError(null)
      setSuccess(null)

      try {
        const result = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: `${value.firstName} ${value.lastName}`,
          callbackURL: search.redirect || '/dashboard',
          firstName: value.firstName,
          lastName: value.lastName
        })

        if (result.error) {
          setError(result.error.message || 'Sign up failed')
          return false
        }

        setSuccess('Account created successfully! Please check your email to verify your account.')
        return formApi.reset()
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
    <div className='w-full max-w-lg space-y-6 p-8'>
      <Card className='w-full min-w-sm'>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription className='text-sm'>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardBody>
          <Activity mode={error ? 'visible' : 'hidden'}>
            <div className='mb-6'>{error ? <Alert variant='danger'>{error}</Alert> : null}</div>
          </Activity>

          <Activity mode={success ? 'visible' : 'hidden'}>
            <div className='mb-6'>
              {success ? <Alert variant='success'>{success}</Alert> : null}
            </div>
          </Activity>

          <SignInWithSocialProvider
            authClient={authClient}
            callbackURL={search.redirect || '/dashboard'}
          />

          <Separator className='my-8' contentSide='center'>
            Or continue with
          </Separator>

          <Form onSubmit={handleSubmit} className='-mt-2 grid gap-4'>
            <div className='grid grid-cols-2 gap-4'>
              <form.AppField
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
                {(field) => <field.TextField label='First Name' />}
              </form.AppField>

              <form.AppField
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
                {(field) => <field.TextField label='Last Name' />}
              </form.AppField>
            </div>

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
              {(field) => <field.TextField label='Email' />}
            </form.AppField>

            <form.AppField
              name='password'
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Password is required'
                  }
                  if (value.length < 8) {
                    return 'Password must be at least 8 characters'
                  }
                  return undefined
                }
              }}
            >
              {(field) => <field.PasswordField label='Password' />}
            </form.AppField>

            <form.AppField
              name='confirmPassword'
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Please confirm your password'
                  }
                  return undefined
                }
              }}
            >
              {(field) => <field.PasswordField label='Confirm Password' />}
            </form.AppField>

            <form.AppForm>
              <form.SubmitButton label='Sign Up' />
            </form.AppForm>
          </Form>
        </CardBody>
        <CardFooter className='w-full items-center justify-center text-center'>
          <Link render={<RouterLink to='/signin' />}>Already have an account? Sign in</Link>
        </CardFooter>
      </Card>
    </div>
  )
}
