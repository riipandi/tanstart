import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { authClient } from '#/guards/auth-client'
import { ensureSession } from '#/guards/session'
import { useAppForm } from '#/hooks/use-form'
import { UserProfile } from './-account/user-profile'

export const Route = createFileRoute('/(app)/account')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await ensureSession()
    return { ...session }
  }
})

const passwordSchema = z.object({
  password: z.string().min(1, { error: 'Password is required' })
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { user } = Route.useRouteContext()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [showEnableDialog, setShowEnableDialog] = useState<'totp' | 'otp' | null>(null)
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [pendingPassword, setPendingPassword] = useState('')

  const twoFactorEnabled =
    (user as unknown as { twoFactorEnabled?: boolean }).twoFactorEnabled ?? false

  const disableForm = useAppForm({
    defaultValues: { password: '' },
    validators: { onChange: passwordSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      setSuccess(null)

      try {
        const result = await authClient.twoFactor.disable({
          password: value.password
        })

        if (result.error) {
          setError(result.error.message || 'Failed to disable 2FA')
          return
        }

        setSuccess('Two-factor authentication has been disabled')
        setShowDisableConfirm(false)
        setPendingPassword('')
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
      }
    }
  })

  const enableWithTotp = async () => {
    if (!pendingPassword) {
      setError('Please enter your password first')
      return
    }

    setError(null)
    try {
      const result = await authClient.twoFactor.enable({
        password: pendingPassword
      })

      if (result.error) {
        setError(result.error.message || 'Failed to enable 2FA')
        return
      }

      if (result.data?.totpURI) {
        setTotpUri(result.data.totpURI)
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    }
  }

  const enableWithOtp = async () => {
    if (!pendingPassword) {
      setError('Please enter your password first')
      return
    }

    setError(null)
    try {
      const result = await authClient.twoFactor.enable({
        password: pendingPassword
      })

      if (result.error) {
        setError(result.error.message || 'Failed to enable 2FA')
        return
      }

      const sendResult = await authClient.twoFactor.sendOtp()
      if (sendResult.error) {
        setError(sendResult.error.message || 'Failed to send OTP')
        return
      }

      navigate({ to: '/two-factor/otp' })
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    }
  }

  const handleGenerateBackupCodes = async () => {
    try {
      const result = await authClient.twoFactor.generateBackupCodes({ password: pendingPassword })
      if (result.error) {
        setError(result.error.message || 'Failed to generate backup codes')
        return
      }

      if (result.data?.backupCodes) {
        setBackupCodes(result.data.backupCodes)
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    }
  }

  const handleSignOut = async () => {
    const result = await authClient.signOut()
    if (result.error) {
      console.error(result.error)
    }
    return navigate({ to: '/signin', search: { logout: true } })
  }

  return (
    <div className='flex justify-center px-4 py-10'>
      <div className='w-full max-w-lg space-y-8 p-6'>
        <div>
          <h1 className='text-xl font-semibold'>Account Settings</h1>
          <p className='text-on-background-neutral mt-1 text-sm'>Manage your account security</p>
        </div>

        <UserProfile {...user} />

        <div className='border-border-neutral rounded-lg border p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-base font-semibold'>Two-Factor Authentication</h2>
              <p className='text-on-background-neutral mt-1 text-sm'>
                {twoFactorEnabled
                  ? 'Your account is protected with 2FA'
                  : 'Add an extra layer of security to your account'}
              </p>
            </div>
            <div
              className={`rounded-full px-3 py-1 text-xs font-medium ${twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
            >
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          {error && (
            <div className='border-border-critical bg-background-critical-faded mt-4 border-l-4 px-3 py-2.5'>
              <p className='text-foreground-critical text-sm'>{error}</p>
            </div>
          )}

          {success && (
            <div className='border-border-success bg-background-success-faded mt-4 border-l-4 px-3 py-2.5'>
              <p className='text-foreground-success text-sm'>{success}</p>
            </div>
          )}

          <div className='mt-6 flex gap-3'>
            {twoFactorEnabled ? (
              <>
                <button
                  type='button'
                  onClick={handleGenerateBackupCodes}
                  className='border-border-neutral bg-background-elevation-base text-foreground-neutral hover:bg-background-neutral-faded rounded-md border px-4 py-2 text-sm font-medium transition-colors'
                >
                  Generate Backup Codes
                </button>
                <button
                  type='button'
                  onClick={() => setShowDisableConfirm(true)}
                  className='border-border-critical text-foreground-critical hover:bg-background-critical-faded rounded-md border px-4 py-2 text-sm font-medium transition-colors'
                >
                  Disable 2FA
                </button>
              </>
            ) : (
              <button
                type='button'
                onClick={() => setShowEnableDialog('totp')}
                className='bg-background-primary hover:bg-background-primary/80 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors'
              >
                Enable 2FA
              </button>
            )}
          </div>

          {backupCodes && backupCodes.length > 0 && (
            <div className='mt-6 rounded-md bg-yellow-50 p-4'>
              <h3 className='mb-2 text-sm font-semibold text-yellow-800'>Backup Codes</h3>
              <p className='mb-3 text-xs text-yellow-700'>
                Save these codes in a safe place. You can use them to access your account if you
                lose your authenticator.
              </p>
              <div className='grid grid-cols-2 gap-2 font-mono text-sm'>
                {backupCodes?.map((code) => (
                  <span key={code} className='text-yellow-800'>
                    {code}
                  </span>
                ))}
              </div>
              <button
                type='button'
                onClick={() => setBackupCodes(null)}
                className='mt-3 text-xs font-medium text-yellow-800 hover:underline'
              >
                Hide codes
              </button>
            </div>
          )}

          {showDisableConfirm && (
            <div className='border-border-neutral bg-background-elevation-base mt-6 rounded-md border p-4'>
              <h3 className='mb-3 text-sm font-semibold'>Confirm Password to Disable</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  disableForm.handleSubmit()
                }}
              >
                <disableForm.AppField
                  name='password'
                  validators={{
                    onBlur: ({ value }) => {
                      if (!value || value.length === 0) {
                        return 'Password is required'
                      }
                      return undefined
                    }
                  }}
                >
                  {(field) => <field.PasswordField label='Password' />}
                </disableForm.AppField>
                <div className='mt-4 flex gap-2'>
                  <disableForm.AppForm>
                    <disableForm.SubmitButton label='Disable 2FA' />
                  </disableForm.AppForm>
                  <button
                    type='button'
                    onClick={() => setShowDisableConfirm(false)}
                    className='border-border-neutral text-foreground-neutral hover:bg-background-neutral-faded rounded-md border px-4 py-2 text-sm font-medium transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {showEnableDialog && (
            <div className='border-border-neutral bg-background-elevation-base mt-6 rounded-md border p-4'>
              <h3 className='mb-3 text-sm font-semibold'>Enable Two-Factor Authentication</h3>
              <p className='text-on-background-neutral mb-4 text-sm'>
                Enter your password and choose how you want to receive verification codes:
              </p>
              <div className='mb-4'>
                <label
                  htmlFor='enable-password'
                  className='text-foreground-neutral mb-1.5 block text-sm font-medium'
                >
                  Password
                </label>
                <input
                  id='enable-password'
                  type='password'
                  value={pendingPassword}
                  onChange={(e) => setPendingPassword(e.target.value)}
                  className='border-border-neutral focus:ring-border-primary mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none'
                  placeholder='Enter your password'
                />
              </div>
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={enableWithTotp}
                  className='bg-background-primary hover:bg-background-primary/80 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors'
                >
                  Authenticator App
                </button>
                <button
                  type='button'
                  onClick={enableWithOtp}
                  className='border-border-neutral bg-background-elevation-base text-foreground-neutral hover:bg-background-neutral-faded rounded-md border px-4 py-2 text-sm font-medium transition-colors'
                >
                  Email OTP
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setShowEnableDialog(null)
                    setPendingPassword('')
                  }}
                  className='text-foreground-neutral text-sm font-medium transition-colors hover:underline'
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {totpUri && (
            <div className='border-border-neutral bg-background-elevation-base mt-6 rounded-md border p-4'>
              <h3 className='mb-3 text-sm font-semibold'>Scan QR Code</h3>
              <p className='text-on-background-neutral mb-4 text-sm'>
                Scan this QR code with your authenticator app, then enter the code below to verify.
              </p>
              <div className='mb-4 flex justify-center'>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri || '')}`}
                  className='rounded-sm'
                  alt='2FA QR Code'
                />
              </div>
              <button
                type='button'
                onClick={() => {
                  setTotpUri(null)
                  setShowEnableDialog(null)
                  setPendingPassword('')
                }}
                className='text-foreground-neutral text-sm font-medium transition-colors hover:underline'
              >
                Done
              </button>
            </div>
          )}
        </div>

        <div className='flex justify-between pt-4'>
          <Link
            to='/dashboard'
            className='text-foreground-primary text-sm font-medium transition-colors hover:underline'
          >
            Back to Dashboard
          </Link>
          <button
            type='button'
            onClick={handleSignOut}
            className='text-foreground-critical text-sm font-medium transition-colors hover:underline'
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
