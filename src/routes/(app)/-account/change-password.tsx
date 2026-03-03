import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { Alert, AlertDescription } from '#/components/alert'
import { Button } from '#/components/button'
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '#/components/card'
import { authClient } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Current password is required' }),
    newPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/[a-zA-Z]/, { message: 'Password must contain at least 1 letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least 1 number' })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: 'Password must contain at least 1 special character'
      }),
    confirmPassword: z.string(),
    revokeOtherSessions: z.boolean()
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword']
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export function ChangePassword() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [revoked, setRevoked] = useState(false)

  const form = useAppForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      revokeOtherSessions: true
    },
    validators: { onChange: changePasswordSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const result = await authClient.changePassword({ ...value })

        if (result.error) {
          setError(result.error.message || 'Failed to change password')
          return
        }

        setRevoked(value.revokeOtherSessions)
        setSuccess(true)
        form.reset()
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
      }
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardBody>
          <div className='flex flex-col items-center text-center'>
            <div className='bg-background-success/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
              <Lucide.Check className='text-foreground-success h-6 w-6' />
            </div>
            <Alert variant='success'>
              <Lucide.CheckCircle className='size-4' />
              <AlertDescription>
                <strong>Password Changed Successfully</strong>
                <br />
                {revoked
                  ? 'Your password has been updated. You have been signed out from all other devices.'
                  : 'Your password has been updated.'}
              </AlertDescription>
            </Alert>
            <Button variant='outline' size='sm' onClick={() => setSuccess(false)} className='mt-4'>
              Change Password Again
            </Button>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your password to keep your account secure</CardDescription>
      </CardHeader>
      <CardBody>
        {error && (
          <Alert variant='danger'>
            <Lucide.AlertCircle className='size-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='grid gap-4'>
          <form.AppField
            name='currentPassword'
            validators={{
              onBlur: ({ value }) => {
                if (!value || value.trim().length === 0) {
                  return 'Current password is required'
                }
                return undefined
              }
            }}
          >
            {(field) => <field.PasswordField label='Current Password' />}
          </form.AppField>

          <form.AppField
            name='newPassword'
            validators={{
              onBlur: ({ value }) => {
                if (!value || value.trim().length === 0) {
                  return 'New password is required'
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
                  return 'Please confirm your new password'
                }
                return undefined
              }
            }}
          >
            {(field) => <field.PasswordField label='Confirm New Password' />}
          </form.AppField>

          <form.AppField name='revokeOtherSessions'>
            {(field) => <field.CheckboxField label='Sign out from all other devices' />}
          </form.AppField>

          <form.AppForm>
            <form.SubmitButton label='Change Password' />
          </form.AppForm>
        </form>
      </CardBody>
    </Card>
  )
}
