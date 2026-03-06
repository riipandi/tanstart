import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { Activity, useState } from 'react'
import { z } from 'zod'
import { Alert } from '#/components/alert'
import { Button } from '#/components/button'
import { Card, CardBody, CardDescription } from '#/components/card'
import { CardFooter, CardHeader, CardTitle } from '#/components/card'
import { Form } from '#/components/form'
import { Link } from '#/components/link'
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
      <div className='w-full max-w-md space-y-6 p-8'>
        <Card className='w-full min-w-sm'>
          <CardHeader>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription className='text-sm'>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardBody className='flex flex-col items-center text-center' />
          <CardFooter className='w-full items-center justify-center'>
            <Link render={<RouterLink to='/forgot-password' />}>Request New Link</Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className='w-full max-w-md space-y-6 p-8'>
        <Card className='w-full min-w-sm'>
          <CardHeader>
            <CardTitle>Password Reset Complete</CardTitle>
            <CardDescription className='text-sm'>
              Your password has been successfully reset.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <Alert variant='success'>
              Your password has been reset successfully! <br />
              You can now use your new password to sign in to your account.
            </Alert>
          </CardBody>
          <CardFooter className='w-full items-center justify-center text-center'>
            <Button block render={<RouterLink to='/signin' />}>
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className='w-full max-w-md space-y-6 p-8'>
      <Card className='w-full min-w-sm'>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription className='text-sm'>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardBody>
          <Activity mode={error ? 'visible' : 'hidden'}>
            <div className='mb-6'>{error ? <Alert variant='danger'>{error}</Alert> : null}</div>
          </Activity>

          <Form onSubmit={handleSubmit} className='grid gap-4'>
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
          </Form>
        </CardBody>
        <CardFooter className='w-full items-center justify-center text-center'>
          <Link render={<RouterLink to='/signin' />}>Back to Sign In</Link>
        </CardFooter>
      </Card>
    </div>
  )
}
