import { createFileRoute, Link } from '@tanstack/react-router'
import { Activity, useState } from 'react'
import { z } from 'zod'
import { publicEnv } from '#/config'
import { authClient } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'

interface SearchParams {
  redirect?: string
}

export const Route = createFileRoute('/(auth)/signin')({
  component: RouteComponent,
  loader: () => {
    return {
      enableSignUp: publicEnv.PUBLIC_ENABLE_SIGNUP
    }
  }
})

const signinSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z.string().min(1, { error: 'Password is required' })
})

function RouteComponent() {
  const loaderData = Route.useLoaderData()
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
        <div className='border-border-neutral-faded border-t-foreground-neutral h-5 w-5 animate-spin rounded-full border-2' />
      </div>
    )
  }

  return (
    <div className='flex justify-center px-4 py-10'>
      <div className='w-full max-w-md p-6'>
        <h1 className='text-lg leading-none font-semibold tracking-tight'>Sign in</h1>
        <p className='text-on-background-neutral mt-2 mb-6 text-sm'>
          Enter your email below to login to your account
        </p>

        <Activity mode={error ? 'visible' : 'hidden'}>
          <div className='border-border-critical bg-background-critical-faded mb-4 border-l-4 px-3 py-2.5'>
            <p className='text-foreground-critical text-sm'>{error}</p>
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

        <Activity mode={loaderData.enableSignUp ? 'visible' : 'hidden'}>
          <div className='mt-4 text-center'>
            <Link
              type='button'
              to='/signup'
              className='text-foreground-primary text-sm font-medium transition-colors hover:underline'
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </Activity>

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
