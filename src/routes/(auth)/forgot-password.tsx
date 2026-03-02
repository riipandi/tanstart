import { createFileRoute, Link } from '@tanstack/react-router'
import { Activity, useState } from 'react'
import { z } from 'zod'
import { publicEnv } from '#/config'
import { authClient } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'

export const Route = createFileRoute('/(auth)/forgot-password')({
  component: RouteComponent
})

const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' })
})

function RouteComponent() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useAppForm({
    defaultValues: { email: '' },
    validators: { onChangeAsync: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const result = await authClient.requestPasswordReset({
          email: value.email,
          redirectTo: `${publicEnv.PUBLIC_BASE_URL}/reset-password`
        })

        if (result.error) {
          setError(result.error.message || 'Failed to send reset email')
          return
        }

        setSuccess(true)
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

  if (success) {
    return (
      <div className='flex justify-center px-4 py-10'>
        <div className='w-full max-w-md p-6'>
          <div className='flex flex-col items-center text-center'>
            <div className='bg-background-success/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
              <svg
                className='text-foreground-success h-6 w-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <h1 className='text-lg leading-none font-semibold tracking-tight'>Check your email</h1>
            <p className='text-on-background-neutral mt-2 mb-6 text-sm'>
              We've sent you a password reset link. Please check your inbox and follow the
              instructions.
            </p>
            <Link
              to='/signin'
              className='bg-foreground-primary text-background-primary hover:bg-foreground-primary/90 focus-visible:outline-foreground-primary inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex justify-center px-4 py-10'>
      <div className='w-full max-w-md p-6'>
        <h1 className='text-lg leading-none font-semibold tracking-tight'>Forgot password</h1>
        <p className='text-on-background-neutral mt-2 mb-6 text-sm'>
          Enter your email address and we'll send you a link to reset your password.
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

          <form.AppForm>
            <form.SubmitButton label='Send Reset Link' />
          </form.AppForm>
        </form>

        <div className='mt-4 text-center'>
          <Link
            to='/signin'
            className='text-foreground-primary text-sm font-medium transition-colors hover:underline'
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
