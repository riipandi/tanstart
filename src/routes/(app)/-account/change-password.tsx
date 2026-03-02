import { useState } from 'react'
import { z } from 'zod'
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
      <div className='border-border-neutral rounded-lg border p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-base font-semibold'>Change Password</h2>
            <p className='text-on-background-neutral mt-1 text-sm'>
              Update your password to keep your account secure
            </p>
          </div>
        </div>

        <div className='mt-6 flex flex-col items-center text-center'>
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
          <h3 className='text-base font-semibold'>Password Changed Successfully</h3>
          <p className='text-on-background-neutral mt-2 text-sm'>
            {revoked
              ? 'Your password has been updated. You have been signed out from all other devices.'
              : 'Your password has been updated.'}
          </p>
          <button
            type='button'
            onClick={() => setSuccess(false)}
            className='text-foreground-primary mt-4 text-sm font-medium transition-colors hover:underline'
          >
            Change Password Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='border-border-neutral rounded-lg border p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-base font-semibold'>Change Password</h2>
          <p className='text-on-background-neutral mt-1 text-sm'>
            Update your password to keep your account secure
          </p>
        </div>
      </div>

      {error && (
        <div className='border-border-critical bg-background-critical-faded mt-4 border-l-4 px-3 py-2.5'>
          <p className='text-foreground-critical text-sm'>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='mt-6 grid gap-4'>
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
    </div>
  )
}
