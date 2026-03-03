import { createFileRoute, Link as RouterLink } from '@tanstack/react-router'
import { Activity, useState } from 'react'
import { z } from 'zod'
import { Alert } from '#/components/alert'
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '#/components/card'
import { Form } from '#/components/form'
import { Link } from '#/components/link'
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
      <div className='w-full max-w-md space-y-8 p-8'>
        <Card className='w-full min-w-sm'>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription className='text-sm'>
              We've sent you a password reset link.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <Alert variant='success'>
              Password reset email sent successfully! If you don't see it in your inbox, please
              check your spam folder.
            </Alert>
          </CardBody>
          <CardFooter className='w-full items-center justify-center text-center'>
            <Link render={<RouterLink to='/signin' />}>Back to Sign In</Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className='w-full max-w-md space-y-8 p-8'>
      <Card className='w-full min-w-sm'>
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription className='text-sm'>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <Activity mode={error ? 'visible' : 'hidden'}>
            <div className='mb-6'>{error ? <Alert variant='danger'>{error}</Alert> : null}</div>
          </Activity>

          <Form onSubmit={handleSubmit} className='grid gap-4'>
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
          </Form>
        </CardBody>
        <CardFooter className='w-full items-center justify-center text-center'>
          <Link render={<RouterLink to='/signin' />}>Back to Sign In</Link>
        </CardFooter>
      </Card>
    </div>
  )
}
