import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { renderSVG } from 'uqr'
import clipboardy from 'clipboardy'
import * as Lucide from 'lucide-react'
import { authClient } from '#/guards/auth-client'
import { Session } from '#/guards/auth-client'
import { useAppForm } from '#/hooks/use-form'

const passwordSchema = z.object({
  password: z.string().min(1, { error: 'Password is required' })
})

const verifySchema = z.object({
  code: z.string().min(6, { error: 'Code must be 6 digits' })
})

export function TwoFactorSettings(user: Session['user']) {
  const navigate = useNavigate()

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [showEnableDialog, setShowEnableDialog] = useState<'totp' | 'otp' | null>(null)
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [pendingPassword, setPendingPassword] = useState('')
  const [showTotpVerify, setShowTotpVerify] = useState(false)
  const [showOtpVerify, setShowOtpVerify] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [storedBackupCodes, setStoredBackupCodes] = useState<string[] | null>(null)
  const [secretKey, setSecretKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null)

  const twoFactorEnabled = user.twoFactorEnabled ?? false

  const extractSecretFromUri = (uri: string): string | null => {
    try {
      const url = new URL(uri)
      return url.searchParams.get('secret')
    } catch {
      return null
    }
  }

  const generateQRCode = (totpUri: string) => {
    try {
      const svg = renderSVG(totpUri, {
        pixelSize: 8,
        ecc: 'M',
        whiteColor: '#ffffff',
        blackColor: '#000000',
        border: 1
      })
      setQrCodeSvg(svg)
    } catch (err) {
      console.error('Failed to generate QR code:', err)
    }
  }

  const handleCopySecret = async () => {
    if (!secretKey) return

    try {
      await clipboardy.write(secretKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const disableForm = useAppForm({
    defaultValues: { password: '' },
    validators: { onChange: passwordSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      setSuccess(null)
      setIsVerifying(true)

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
        navigate({ to: '/account' })
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
      } finally {
        setIsVerifying(false)
      }
    }
  })

  const handleVerifyTotp = async (code: string) => {
    setError(null)
    setIsVerifying(true)

    try {
      const result = await authClient.twoFactor.verifyTotp({
        code
      })

      if (result.error) {
        setError(result.error.message || 'Invalid verification code')
        return
      }

      setSuccess('Two-factor authentication has been enabled')
      setBackupCodes(storedBackupCodes || [])
      setShowTotpVerify(false)
      setTotpUri(null)
      setSecretKey(null)
      setQrCodeSvg(null)
      setCopied(false)
      setPendingPassword('')
      setStoredBackupCodes(null)
      navigate({ to: '/account' })
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVerifyOtp = async (code: string) => {
    setError(null)
    setIsVerifying(true)

    try {
      const result = await authClient.twoFactor.verifyOtp({
        code
      })

      if (result.error) {
        setError(result.error.message || 'Invalid verification code')
        return
      }

      setSuccess('Two-factor authentication has been enabled')
      setBackupCodes(storedBackupCodes || [])
      setShowOtpVerify(false)
      setPendingPassword('')
      setStoredBackupCodes(null)
      navigate({ to: '/account' })
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
    } finally {
      setIsVerifying(false)
    }
  }

  const enableWithTotp = async () => {
    if (!pendingPassword) {
      setError('Please enter your password first')
      return
    }

    setError(null)
    setIsVerifying(true)

    try {
      const result = await authClient.twoFactor.enable({
        password: pendingPassword
      })

      if (result.error) {
        setError(result.error.message || 'Failed to enable 2FA')
        setIsVerifying(false)
        return
      }

      if (result.data?.totpURI) {
        setTotpUri(result.data.totpURI)
        generateQRCode(result.data.totpURI)
        const secret = extractSecretFromUri(result.data.totpURI)
        setSecretKey(secret)
      }

      if (result.data?.backupCodes) {
        setStoredBackupCodes(result.data.backupCodes)
      }

      setShowEnableDialog(null)
      setShowTotpVerify(true)
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
      setIsVerifying(false)
    } finally {
      setIsVerifying(false)
    }
  }

  const enableWithOtp = async () => {
    if (!pendingPassword) {
      setError('Please enter your password first')
      return
    }

    setError(null)
    setIsVerifying(true)

    try {
      const result = await authClient.twoFactor.enable({
        password: pendingPassword
      })

      if (result.error) {
        setError(result.error.message || 'Failed to enable 2FA')
        setIsVerifying(false)
        return
      }

      if (result.data?.backupCodes) {
        setStoredBackupCodes(result.data.backupCodes)
      }

      const sendResult = await authClient.twoFactor.sendOtp()
      if (sendResult.error) {
        setError(sendResult.error.message || 'Failed to send OTP')
        setIsVerifying(false)
        return
      }

      setShowEnableDialog(null)
      setShowOtpVerify(true)
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
      setIsVerifying(false)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleGenerateBackupCodes = async () => {
    setIsVerifying(true)
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
    } finally {
      setIsVerifying(false)
    }
  }

  const verifyForm = useAppForm({
    defaultValues: { code: '' },
    validators: { onChange: verifySchema },
    onSubmit: async ({ value }) => {
      if (showTotpVerify) {
        await handleVerifyTotp(value.code)
      } else if (showOtpVerify) {
        await handleVerifyOtp(value.code)
      }
    }
  })

  return (
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
              disabled={isVerifying}
              className='border-border-neutral bg-background-elevation-base text-foreground-neutral hover:bg-background-neutral-faded rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isVerifying ? 'Generating...' : 'Generate Backup Codes'}
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
            Save these codes in a safe place. You can use them to access your account if you lose
            your authenticator.
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
                <disableForm.SubmitButton label={isVerifying ? 'Disabling...' : 'Disable 2FA'} />
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
              disabled={isVerifying}
              className='bg-background-primary hover:bg-background-primary/80 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isVerifying ? 'Setting up...' : 'Authenticator App'}
            </button>
            <button
              type='button'
              onClick={enableWithOtp}
              disabled={isVerifying}
              className='border-border-neutral bg-background-elevation-base text-foreground-neutral hover:bg-background-neutral-faded rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isVerifying ? 'Sending...' : 'Email OTP'}
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
        <div className='border-border-neutral bg-background-elevation-base mt-6 rounded-md border p-6'>
          <h3 className='mb-4 text-center text-base font-semibold'>Set Up Authenticator App</h3>

          {/* QR Code Section */}
          <div className='mb-6 flex justify-center'>
            {qrCodeSvg ? (
              <div
                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                className='rounded-md bg-white p-2'
                style={{ width: '200px', height: '200px' }}
              />
            ) : (
              <div className='bg-background-neutral h-[200px] w-[200px] animate-pulse rounded-md' />
            )}
          </div>

          {/* Divider */}
          <div className='border-border-neutral my-6 flex items-center gap-4'>
            <div className='h-px flex-1 border-t' />
            <span className='text-on-background-neutral text-xs uppercase'>Or enter manually</span>
            <div className='h-px flex-1 border-t' />
          </div>

          {/* Manual Entry Section */}
          <div className='space-y-4'>
            <div>
              <label className='text-foreground-neutral mb-2 block text-sm font-medium'>Secret Key</label>
              <div className='flex gap-2'>
                <input
                  type='text'
                  readOnly
                  value={secretKey || ''}
                  className='border-border-neutral bg-background-neutral w-full rounded-md border px-3 py-2 font-mono text-sm'
                  placeholder='Loading secret key...'
                />
                <button
                  type='button'
                  onClick={handleCopySecret}
                  disabled={!secretKey || copied}
                  className='border-border-neutral bg-background-elevation-base text-foreground-neutral hover:bg-background-neutral-faded flex w-12 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                  title={copied ? 'Copied!' : 'Copy secret key'}
                >
                  {copied ? <Lucide.Check className='h-5 w-5 text-green-600' /> : <Lucide.Copy className='h-5 w-5' />}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className='border-border-neutral bg-background-neutral rounded-md border p-4'>
              <h4 className='text-foreground-neutral mb-2 text-sm font-semibold'>How to add manually:</h4>
              <ol className='text-on-background-neutral list-decimal space-y-1 pl-4 text-sm'>
                <li>Open your authenticator app</li>
                <li>Select &quot;Enter manually&quot; or &quot;Add manually&quot;</li>
                <li>Copy the secret key above</li>
                <li>Paste it into your authenticator app</li>
                <li>Enter the verification code below</li>
              </ol>
            </div>
          </div>

          {/* Verification Form */}
          {showTotpVerify && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                verifyForm.handleSubmit()
              }}
              className='mt-6 space-y-4'
            >
              <verifyForm.AppField
                name='code'
                validators={{
                  onBlur: ({ value }) => {
                    if (!value || value.length !== 6) {
                      return 'Please enter a valid 6-digit code'
                    }
                    if (!/^\d+$/.test(value)) {
                      return 'Code must contain only numbers'
                    }
                    return undefined
                  }
                }}
              >
                {(field) => (
                  <div>
                    <label htmlFor={field.name} className='text-foreground-neutral mb-1.5 block text-sm font-medium'>
                      Verification Code
                    </label>
                    <input
                      type='text'
                      inputMode='numeric'
                      maxLength={6}
                      autoComplete='one-time-code'
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onBlur={field.handleBlur}
                      className='border-border-neutral focus:ring-border-primary mt-1 block w-full rounded-md border px-3 py-2 text-center text-2xl tracking-[0.5em] focus:ring-2 focus:outline-none'
                      placeholder='000000'
                    />
                  </div>
                )}
              </verifyForm.AppField>

              <div className='flex gap-2'>
                <verifyForm.AppForm>
                  <verifyForm.SubmitButton label={isVerifying ? 'Verifying...' : 'Verify'} />
                </verifyForm.AppForm>
                <button
                  type='button'
                  onClick={() => {
                    setTotpUri(null)
                    setShowTotpVerify(false)
                    setStoredBackupCodes(null)
                    setSecretKey(null)
                    setQrCodeSvg(null)
                    setCopied(false)
                    verifyForm.reset()
                  }}
                  className='text-foreground-neutral text-sm font-medium transition-colors hover:underline'
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!showTotpVerify && (
            <div className='mt-6 flex justify-end'>
              <button
                type='button'
                onClick={() => {
                  setTotpUri(null)
                  setShowEnableDialog(null)
                  setPendingPassword('')
                  setStoredBackupCodes(null)
                  setSecretKey(null)
                  setQrCodeSvg(null)
                  setCopied(false)
                }}
                className='text-foreground-neutral text-sm font-medium transition-colors hover:underline'
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {showOtpVerify && (
        <div className='border-border-neutral bg-background-elevation-base mt-6 rounded-md border p-4'>
          <h3 className='mb-3 text-sm font-semibold'>Verify Email OTP</h3>
          <p className='text-on-background-neutral mb-4 text-sm'>
            We've sent a 6-digit code to your email address. Enter the code below to complete the
            setup.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              verifyForm.handleSubmit()
            }}
            className='space-y-4'
          >
            <verifyForm.AppField
              name='code'
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.length !== 6) {
                    return 'Please enter a valid 6-digit code'
                  }
                  if (!/^\d+$/.test(value)) {
                    return 'Code must contain only numbers'
                  }
                  return undefined
                }
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className='text-foreground-neutral mb-1.5 block text-sm font-medium'
                  >
                    Verification Code
                  </label>
                  <input
                    type='text'
                    inputMode='numeric'
                    maxLength={6}
                    autoComplete='one-time-code'
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    onBlur={field.handleBlur}
                    className='border-border-neutral focus:ring-border-primary mt-1 block w-full rounded-md border px-3 py-2 text-center text-2xl tracking-[0.5em] focus:ring-2 focus:outline-none'
                    placeholder='000000'
                  />
                </div>
              )}
            </verifyForm.AppField>

            <div className='flex gap-2'>
              <verifyForm.AppForm>
                <verifyForm.SubmitButton label={isVerifying ? 'Verifying...' : 'Verify'} />
              </verifyForm.AppForm>
              <button
                type='button'
                onClick={() => {
                  setShowOtpVerify(false)
                  setStoredBackupCodes(null)
                  verifyForm.reset()
                }}
                className='text-foreground-neutral text-sm font-medium transition-colors hover:underline'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
