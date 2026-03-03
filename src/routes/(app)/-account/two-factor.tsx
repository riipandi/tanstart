import { useNavigate } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { useState, useCallback, Activity } from 'react'
import { Alert, AlertDescription } from '#/components/alert'
import { Button } from '#/components/button'
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
  CardHeaderAction
} from '#/components/card'
import { Label } from '#/components/label'
import { Switch } from '#/components/switch'
import { Session } from '#/guards/auth-client'
import { useTwoFactorSetup, useQRCode } from '#/hooks/use-two-factor'
import { TwoFactorBackupCodes } from './two-factor-backup-codes'
import { TwoFactorBackupPassword } from './two-factor-backup-password'
import { TwoFactorDisable } from './two-factor-disable'
import { TwoFactorPasswordInput } from './two-factor-password-input'
import { TwoFactorMethodSelection } from './two-factor-step-method'
import { TwoFactorStepOTP } from './two-factor-step-otp'
import { TwoFactorStepSuccess } from './two-factor-step-success'
import { TwoFactorStepTOTP } from './two-factor-step-totp'
import { TwoFactorStepper } from './two-factor-stepper'

type WizardStep = 'idle' | 'method' | 'password' | 'verify-for-backup' | 'setup' | 'success'
type SetupMethod = 'totp' | 'otp' | null

const STEPS = ['Method', 'Setup', 'Complete']

export function TwoFactorSettings(user: Session['user']) {
  const navigate = useNavigate()
  const twoFactorEnabled = user.twoFactorEnabled ?? false

  const [step, setStep] = useState<WizardStep>('idle')
  const [method, setMethod] = useState<SetupMethod>(null)
  const [pendingPassword, setPendingPassword] = useState('')
  const [backupPassword, setBackupPassword] = useState('')
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
      case 'verify-for-backup':
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
    setBackupPassword('')
    setTotpUri(null)
    setBackupCodes(null)
    clearQRCode()
    clearStoredBackupCodes()
    clearError()
  }, [clearQRCode, clearStoredBackupCodes, clearError])

  const handleGenerateBackupCodesClick = () => {
    setStep('verify-for-backup')
  }

  const handleBackupPasswordSubmit = async () => {
    if (!backupPassword) return

    const result = await generateBackupCodesAction(backupPassword)
    if (result.error) return

    if (result.data?.backupCodes) {
      setGeneratedBackupCodes(result.data.backupCodes)
    }

    setBackupPassword('')
    setStep('idle')
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

  const handleDisable = async (password: string) => {
    const result = await disableTwoFactor(password)
    if (result.error) return

    resetWizard()
    navigate({ to: '/account' })
  }

  const handleResendOtp = async () => {
    return await sendOtp()
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              {twoFactorEnabled
                ? 'Your account is protected with 2FA'
                : 'Add an extra layer of security to your account'}
            </CardDescription>
          </div>

          <CardHeaderAction>
            <Activity mode={step === 'idle' && twoFactorEnabled ? 'visible' : 'hidden'}>
              <Button
                type='button'
                variant='outline'
                onClick={handleGenerateBackupCodesClick}
                disabled={isVerifying}
              >
                {isVerifying ? 'Generating...' : 'Generate Backup Codes'}
              </Button>
            </Activity>

            <Activity mode={step === 'idle' && !twoFactorEnabled ? 'visible' : 'hidden'}>
              <Button
                type='button'
                variant='primary'
                onClick={handleGenerateBackupCodesClick}
                disabled={isVerifying}
              >
                Enable 2FA
              </Button>
            </Activity>
          </CardHeaderAction>
        </div>
      </CardHeader>

      <CardBody>
        {error && (
          <Alert variant='danger'>
            <Lucide.AlertCircle className='size-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step !== 'idle' && step !== 'success' && (
          <TwoFactorStepper currentStep={getStepNumber()} steps={STEPS} />
        )}

        <div className='space-y-3'>
          <Activity mode={step === 'idle' ? 'visible' : 'hidden'}>
            <div className='border-border-neutral-faded flex items-center justify-between rounded-lg border p-4 pr-5'>
              <div className='flex items-center gap-3'>
                <div className='bg-background-neutral-faded flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                  <Lucide.ShieldCheck />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>Authenticator Device</span>
                  </div>
                  <p className='text-on-background-neutral text-xs'>Enabled since: dd/mm/yyyy</p>
                </div>
              </div>
              <Label>
                <Switch readOnly disabled />
                <span className='sr-only'>Toggle 2FA</span>
              </Label>
            </div>

            <div className='border-border-neutral-faded flex items-center justify-between rounded-lg border p-4 pr-5'>
              <div className='flex items-center gap-3'>
                <div className='bg-background-neutral-faded flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                  <Lucide.ShieldCheck />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>Email OTP</span>
                  </div>
                  <p className='text-on-background-neutral text-xs'>Enabled since: dd/mm/yyyy</p>
                </div>
              </div>
              <Label>
                <Switch readOnly disabled />
                <span className='sr-only'>Toggle 2FA</span>
              </Label>
            </div>
          </Activity>

          <Activity mode={step === 'password' && !twoFactorEnabled ? 'visible' : 'hidden'}>
            <TwoFactorPasswordInput
              password={pendingPassword}
              onPasswordChange={setPendingPassword}
              onSubmit={handlePasswordSubmit}
              isVerifying={isVerifying}
              onCancel={resetWizard}
            />
          </Activity>

          <Activity mode={step === 'password' && twoFactorEnabled ? 'visible' : 'hidden'}>
            <TwoFactorDisable
              isVerifying={isVerifying}
              onDisable={handleDisable}
              onCancel={resetWizard}
            />
          </Activity>

          <Activity mode={step === 'verify-for-backup' ? 'visible' : 'hidden'}>
            <TwoFactorBackupPassword
              password={backupPassword}
              onPasswordChange={setBackupPassword}
              onSubmit={handleBackupPasswordSubmit}
              isVerifying={isVerifying}
              onCancel={resetWizard}
            />
          </Activity>

          <Activity mode={step === 'method' ? 'visible' : 'hidden'}>
            <TwoFactorMethodSelection onSelectMethod={handleMethodSelect} onCancel={resetWizard} />
          </Activity>

          <Activity mode={step === 'setup' && method === 'totp' && totpUri ? 'visible' : 'hidden'}>
            <TwoFactorStepTOTP
              totpUri={totpUri || ''}
              qrCodeSvg={qrCodeSvg}
              isVerifying={isVerifying}
              onVerify={handleVerifyTotp}
              onCancel={resetWizard}
            />
          </Activity>

          <Activity mode={step === 'setup' && method === 'otp' ? 'visible' : 'hidden'}>
            <TwoFactorStepOTP
              onSendOtp={handleResendOtp}
              onVerify={handleVerifyOtp}
              onCancel={resetWizard}
              isVerifying={isVerifying}
              error={error}
            />
          </Activity>

          <Activity mode={step === 'success' && backupCodes ? 'visible' : 'hidden'}>
            <TwoFactorStepSuccess
              backupCodes={backupCodes || []}
              onComplete={handleSuccessComplete}
            />
          </Activity>
        </div>

        <Activity
          mode={generatedBackupCodes && generatedBackupCodes.length > 0 ? 'visible' : 'hidden'}
        >
          <TwoFactorBackupCodes codes={generatedBackupCodes || []} />
        </Activity>

        <Activity mode={backupCodes && step === 'idle' ? 'visible' : 'hidden'}>
          <TwoFactorBackupCodes codes={backupCodes || []} />
        </Activity>
      </CardBody>
    </Card>
  )
}
