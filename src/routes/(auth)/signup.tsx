import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Activity, useState } from 'react'
import { z } from 'zod'
import { publicEnv } from '#/config'
import { authClient } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'
import { SignInWithSocialProvider } from './-social'

interface SearchParams {
  redirect?: string
}

export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent,
  beforeLoad: () => {
    if (!publicEnv.PUBLIC_ENABLE_SIGNUP) {
      throw notFound()
    }
  }
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
  const search: SearchParams = Route.useSearch()
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
        } as any)

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
    <div className='flex justify-center px-4 py-10'>
      <div className='w-full max-w-md p-6'>
        <h1 className='text-lg leading-none font-semibold tracking-tight'>Create an account</h1>
        <p className='text-on-background-neutral mt-2 mb-6 text-sm'>
          Enter your details below to create your account
        </p>

        <Activity mode={error ? 'visible' : 'hidden'}>
          <div className='border-border-critical bg-background-critical-faded mb-4 border-l-4 px-3 py-2.5'>
            <p className='text-foreground-critical text-sm'>{error}</p>
          </div>
        </Activity>

        <Activity mode={success ? 'visible' : 'hidden'}>
          <div className='border-border-positive bg-background-positive-faded mb-4 border-l-4 px-3 py-2.5'>
            <p className='text-foreground-positive text-sm'>{success}</p>
          </div>
        </Activity>

        <form onSubmit={handleSubmit} className='grid gap-4'>
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

          {/* <form.AppField
              name='phone'
              validators={{
                onBlur: ({ value }) => {
                  if (!/^(\+\d{1,3})?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value)) {
                    return 'Invalid phone number format'
                  }
                  return undefined
                }
              }}
            >
              {(field) => <field.TextField label='Phone' placeholder='123-456-7890' />}
            </form.AppField> */}

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
        </form>

        <SignInWithSocialProvider
          authClient={authClient}
          callbackURL={search.redirect || '/dashboard'}
        />

        <div className='mt-4 text-center'>
          <Link
            type='button'
            to='/signin'
            className='text-foreground-primary text-sm font-medium transition-colors hover:underline'
          >
            Already have an account? Sign in
          </Link>
        </div>

        <p className='text-on-background-neutral mt-6 text-center text-xs'>
          Built with{' '}
          <a
            href='https://better-auth.com'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-foreground-neutral font-medium'
          >
            BETTER-AUTH
          </a>
          .
        </p>
      </div>
    </div>
  )
}
