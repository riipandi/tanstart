import { useNavigate } from '@tanstack/react-router'
import { useState, useCallback, useEffect } from 'react'
import { Session } from '#/guards/auth-client'
import { useTwoFactorSetup, useQRCode } from '#/hooks/use-two-factor'
import { TwoFactorBackupCodes } from './two-factor-backup-codes'
import { TwoFactorDisable } from './two-factor-disable'
import { TwoFactorPasswordInput } from './two-factor-password-input'
import { TwoFactorStatus } from './two-factor-status'
import { TwoFactorMethodSelection } from './two-factor-step-method'
import { TwoFactorStepOTP } from './two-factor-step-otp'
import { TwoFactorStepSuccess } from './two-factor-step-success'
import { TwoFactorStepTOTP } from './two-factor-step-totp'
import { TwoFactorStepper } from './two-factor-stepper'

type WizardStep = 'idle' | 'method' | 'password' | 'setup' | 'success'
type SetupMethod = 'totp' | 'otp' | null

const STEPS = ['Method', 'Setup', 'Complete']

export function TwoFactorSettings(user: Session['user']) {
  const navigate = useNavigate()
  const twoFactorEnabled = user.twoFactorEnable ?? false

  const [step, setStep] = useState<WizardStep>('idle')
  const [method, setMethod] = useState<SetupMethod>(null)
  const [pendingPassword, setPendingPassword] = useState('')
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [generatedBackupCodes, setGeneratedBackupCodes] = useState<string[] | null>(null)

  const { qrCodeSvg, generateQRCode, clearQRCode } = useQRCode()
  const {
    isVerifying,
    error,
    enableTwoFactor,
    verifyTotp,
    verifyOtp,
    sendOtp,
    disableTwoFactor,
    generateBackupCodes: generateBackupCodesAction,
    clearError,
    clearStoredBackupCodes
  } = useTwoFactorSetup()

  const getStepNumber = useCallback((): number => {
    switch (step) {
      case 'method':
        return 1
      case 'password':
      case 'setup':
        return 2
      case 'success':
        return 3
      default:
        return 0
    }
  }, [step])

  const resetWizard = useCallback(() => {
    setStep('idle')
    setMethod(null)
    setPendingPassword('')
    setTotpUri(null)
    setBackupCodes(null)
    clearQRCode()
    clearStoredBackupCodes()
    clearError()
  }, [clearQRCode, clearStoredBackupCodes, clearError])

  const handleGenerateBackupCodes = async () => {
    const result = await generateBackupCodesAction(pendingPassword)
    if (result.data?.backupCodes) {
      setGeneratedBackupCodes(result.data.backupCodes)
    }
  }

  const handleEnableStart = () => {
    setStep('password')
  }

  const handlePasswordSubmit = async () => {
    if (!pendingPassword) return

    const result = await enableTwoFactor(pendingPassword)
    if (result.error || !result.data) return

    if (result.data.totpURI) {
      setTotpUri(result.data.totpURI)
    }

    setStep('method')
  }

  const handleMethodSelect = async (selectedMethod: 'totp' | 'otp') => {
    setMethod(selectedMethod)

    if (selectedMethod === 'totp' && totpUri) {
      generateQRCode(totpUri)
    } else if (selectedMethod === 'otp') {
      await sendOtp()
    }

    setStep('setup')
  }

  const handleVerifyTotp = async (code: string) => {
    const result = await verifyTotp(code)
    if (result.error) return

    if (result.backupCodes) {
      setBackupCodes(result.backupCodes)
    }
    setStep('success')
  }

  const handleVerifyOtp = async (code: string) => {
    const result = await verifyOtp(code)
    if (result.error) return

    if (result.backupCodes) {
      setBackupCodes(result.backupCodes)
    }
    setStep('success')
  }

  const handleSuccessComplete = () => {
    resetWizard()
    navigate({ to: '/account' })
  }

  const handleDisableStart = () => {
    setStep('password')
  }

  const handleDisable = async (password: string) => {
    const result = await disableTwoFactor(password)
    if (result.error) return

    resetWizard()
    navigate({ to: '/account' })
  }

  const handleResendOtp = async () => {
    return await sendOtp()
  }

  useEffect(() => {
    if (step === 'idle') {
      setGeneratedBackupCodes(null)
    }
  }, [step])

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
        <TwoFactorStatus enabled={twoFactorEnabled} />
      </div>

      {error && (
        <div className='border-border-critical bg-background-critical-faded mt-4 border-l-4 px-3 py-2.5'>
          <p className='text-foreground-critical text-sm'>{error}</p>
        </div>
      )}

      {step !== 'idle' && step !== 'success' && (
        <TwoFactorStepper currentStep={getStepNumber()} steps={STEPS} />
      )}

      <div className='mt-6'>
        {step === 'idle' && (
          <div className='flex gap-3'>
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
                  onClick={handleDisableStart}
                  className='border-border-critical text-foreground-critical hover:bg-background-critical-faded rounded-md border px-4 py-2 text-sm font-medium transition-colors'
                >
                  Disable 2FA
                </button>
              </>
            ) : (
              <button
                type='button'
                onClick={handleEnableStart}
                className='bg-background-primary hover:bg-background-primary/80 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors'
              >
                Enable 2FA
              </button>
            )}
          </div>
        )}

        {step === 'password' && !twoFactorEnabled && (
          <TwoFactorPasswordInput
            password={pendingPassword}
            onPasswordChange={setPendingPassword}
            onSubmit={handlePasswordSubmit}
            isVerifying={isVerifying}
            onCancel={resetWizard}
          />
        )}

        {step === 'password' && twoFactorEnabled && (
          <TwoFactorDisable
            isVerifying={isVerifying}
            onDisable={handleDisable}
            onCancel={resetWizard}
          />
        )}

        {step === 'method' && (
          <TwoFactorMethodSelection onSelectMethod={handleMethodSelect} onCancel={resetWizard} />
        )}

        {step === 'setup' && method === 'totp' && totpUri && (
          <TwoFactorStepTOTP
            totpUri={totpUri}
            qrCodeSvg={qrCodeSvg}
            isVerifying={isVerifying}
            onVerify={handleVerifyTotp}
            onCancel={resetWizard}
          />
        )}

        {step === 'setup' && method === 'otp' && (
          <TwoFactorStepOTP
            onSendOtp={handleResendOtp}
            onVerify={handleVerifyOtp}
            onCancel={resetWizard}
            isVerifying={isVerifying}
            error={error}
          />
        )}

        {step === 'success' && backupCodes && (
          <TwoFactorStepSuccess backupCodes={backupCodes} onComplete={handleSuccessComplete} />
        )}
      </div>

      {generatedBackupCodes && generatedBackupCodes.length > 0 && (
        <TwoFactorBackupCodes codes={generatedBackupCodes} />
      )}

      {backupCodes && step === 'idle' && <TwoFactorBackupCodes codes={backupCodes} />}
    </div>
  )
}
