import { createFileRoute, Link } from '@tanstack/react-router'
import { Activity, useState } from 'react'
import { z } from 'zod'
import { authClient } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'

export const Route = createFileRoute('/(auth)/reset-password')({
  component: RouteComponent,
  validateSearch: z.object({
    token: z.string().optional()
  })
})

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[a-zA-Z]/, { message: 'Password must contain at least 1 letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least 1 number' })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: 'Password must contain at least 1 special character'
      }),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

function RouteComponent() {
  const search = Route.useSearch()
  const token = search.token
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useAppForm({
    defaultValues: { password: '', confirmPassword: '' },
    validators: { onChange: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      if (!token) {
        setError('Invalid reset token')
        return
      }

      setError(null)
      try {
        const result = await authClient.resetPassword({
          token,
          newPassword: value.password
        })

        if (result.error) {
          setError(result.error.message || 'Failed to reset password')
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

  if (!token) {
    return (
      <div className='flex justify-center px-4 py-10'>
        <div className='w-full max-w-md p-6'>
          <div className='flex flex-col items-center text-center'>
            <h1 className='text-lg leading-none font-semibold tracking-tight'>Invalid Link</h1>
            <p className='text-on-background-neutral mt-2 mb-6 text-sm'>
              This password reset link is invalid or has expired.
            </p>
            <Link
              to='/forgot-password'
              className='bg-foreground-primary text-background-primary hover:bg-foreground-primary/90 focus-visible:outline-foreground-primary inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    )
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
            <h1 className='text-lg leading-none font-semibold tracking-tight'>
              Password Reset Complete
            </h1>
            <p className='text-on-background-neutral mt-2 mb-6 text-sm'>
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Link
              to='/signin'
              className='bg-foreground-primary text-background-primary hover:bg-foreground-primary/90 focus-visible:outline-foreground-primary inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex justify-center px-4 py-10'>
      <div className='w-full max-w-md p-6'>
        <h1 className='text-lg leading-none font-semibold tracking-tight'>Reset Password</h1>
        <p className='text-on-background-neutral mt-2 mb-6 text-sm'>
          Enter your new password below.
        </p>

        <Activity mode={error ? 'visible' : 'hidden'}>
          <div className='border-border-critical bg-background-critical-faded mb-4 border-l-4 px-3 py-2.5'>
            <p className='text-foreground-critical text-sm'>{error}</p>
          </div>
        </Activity>

        <form onSubmit={handleSubmit} className='grid gap-4'>
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
            {(field) => <field.PasswordField label='New Password' />}
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
            <form.SubmitButton label='Reset Password' />
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
