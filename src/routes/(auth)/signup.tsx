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

const signupSchema = z.object({
  name: z.string().min(1, { error: 'Name is required' }),
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z.string().min(8, { error: 'Password must be at least 8 characters' }),
  confirmPassword: z.string().min(1, { error: 'Please confirm your password' })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const search: SearchParams = Route.useSearch()
  const { isPending } = authClient.useSession()
  const [error, setError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    validators: { onChangeAsync: signupSchema },
    onSubmit: async ({ value, formApi }) => {
      setError(null)
      try {
        const result = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,
          callbackURL: search.redirect || '/'
        })
        if (result.error) {
          setError(result.error.message || 'Sign up failed')
        }
        formApi.reset()
        const redirectTo = search.redirect || '/'
        return navigate({ to: redirectTo })
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
          <div className='border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20'>
            <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
          </div>
        </Activity>

        <form onSubmit={handleSubmit} className='grid gap-4'>
          <div className='grid gap-2'>
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
          </div>

          <div className='grid gap-2'>
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
          </div>

          <div className='grid gap-2'>
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
          </div>

          <div className='grid gap-2'>
            <form.AppField
              name='confirmPassword'
              validators={{
                onBlur: ({ value, values }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Please confirm your password'
                  }
                  if (values.password && value !== values.password) {
                    return "Passwords don't match"
                  }
                  return undefined
                }
              }}
            >
              {(field) => <field.PasswordField label='Confirm Password' />}
            </form.AppField>
          </div>

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
