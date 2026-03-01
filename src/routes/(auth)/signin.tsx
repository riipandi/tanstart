import { createFileRoute, Link } from '@tanstack/react-router'
import { Activity, useState } from 'react'
import { z } from 'zod'
import { authClient } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'

interface SearchParams {
  redirect?: string
}

export const Route = createFileRoute('/(auth)/signin')({
  component: RouteComponent
})

const signinSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z.string().min(1, { error: 'Password is required' })
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const search: SearchParams = Route.useSearch()
  const { isPending } = authClient.useSession()
  const [error, setError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    validators: { onChangeAsync: signinSchema },
    onSubmit: async ({ value, formApi }) => {
      setError(null)
      try {
        const result = await authClient.signIn.email(value)
        if (result.error) {
          setError(result.error.message || 'Sign in failed')
          return formApi.resetField('password')
        }
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
        <h1 className='text-lg leading-none font-semibold tracking-tight'>Sign in</h1>
        <p className='mt-2 mb-6 text-sm text-neutral-500 dark:text-neutral-400'>
          Enter your email below to login to your account
        </p>

        <Activity mode={error ? 'visible' : 'hidden'}>
          <div className='mb-4 border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20'>
            <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
          </div>
        </Activity>

        <form onSubmit={handleSubmit} className='grid gap-4'>
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
                return undefined
              }
            }}
          >
            {(field) => <field.PasswordField label='Password' />}
          </form.AppField>

          <form.AppForm>
            <form.SubmitButton label='Sign In' />
          </form.AppForm>
        </form>

        <div className='mt-4 text-center'>
          <Link
            type='button'
            to='/signup'
            className='text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
          >
            Don't have an account? Sign up
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
