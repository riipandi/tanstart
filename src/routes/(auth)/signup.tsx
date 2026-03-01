import { createFileRoute, Link } from '@tanstack/react-router'
import { Activity, useState } from 'react'
import { z } from 'zod'
import { useAppForm } from '#/hooks/use-form'
import { authClient } from '#/lib/auth-client'

interface SearchParams {
  redirect?: string
}

export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent
})

const signupSchema = z
  .object({
    name: z.string().min(1, { error: 'Name is required' }),
    email: z.email({ error: 'Please enter a valid email address' }),
    password: z.string().min(8, { error: 'Password must be at least 8 characters' }),
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
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    validators: { onChangeAsync: signupSchema },
    onSubmit: async ({ value, formApi }) => {
      setError(null)
      setSuccess(null)

      try {
        const result = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,
          callbackURL: search.redirect || '/'
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
        <div className='h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-800 dark:border-t-neutral-100' />
      </div>
    )
  }

  return (
    <div className='flex justify-center px-4 py-10'>
      <div className='w-full max-w-md p-6'>
        <h1 className='text-lg leading-none font-semibold tracking-tight'>Create an account</h1>
        <p className='mt-2 mb-6 text-sm text-neutral-500 dark:text-neutral-400'>
          Enter your details below to create your account
        </p>

        <Activity mode={error ? 'visible' : 'hidden'}>
          <div className='mb-4 border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20'>
            <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
          </div>
        </Activity>

        <Activity mode={success ? 'visible' : 'hidden'}>
          <div className='mb-4 border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20'>
            <p className='text-sm text-green-600 dark:text-green-400'>{success}</p>
          </div>
        </Activity>

        <form onSubmit={handleSubmit} className='grid gap-4'>
          <form.AppField
            name='name'
            validators={{
              onBlur: ({ value }) => {
                if (!value || value.trim().length === 0) {
                  return 'Name is required'
                }
                return undefined
              }
            }}
          >
            {(field) => <field.TextField label='Name' />}
          </form.AppField>

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

        <div className='mt-4 text-center'>
          <Link
            type='button'
            to='/signin'
            className='text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
          >
            Already have an account? Sign in
          </Link>
        </div>

        <p className='mt-6 text-center text-xs text-neutral-400 dark:text-neutral-500'>
          Built with{' '}
          <a
            href='https://better-auth.com'
            target='_blank'
            rel='noopener noreferrer'
            className='font-medium hover:text-neutral-600 dark:hover:text-neutral-300'
          >
            BETTER-AUTH
          </a>
          .
        </p>
      </div>
    </div>
  )
}
