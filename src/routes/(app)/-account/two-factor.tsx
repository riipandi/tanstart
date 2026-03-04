import { useNavigate } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { useState, useCallback, useEffect, useRef, Activity } from 'react'
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
import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose
} from '#/components/dialog'
import { Field } from '#/components/field'
import { InputPassword } from '#/components/input-password'
import { Label } from '#/components/label'
import { Switch } from '#/components/switch'
import { Session } from '#/guards/auth-client'
import { useTwoFactorSetup, useQRCode } from '#/hooks/use-two-factor'
import { TwoFactorBackupCodes } from './two-factor-backup-codes'
import { TwoFactorStepSuccess } from './two-factor-step-success'
import { TwoFactorStepTOTP } from './two-factor-step-totp'

type WizardStep = 'idle' | 'setup' | 'success'

export function TwoFactorSettings(user: Session['user']) {
  const navigate = useNavigate()
  const twoFactorEnabled = user.twoFactorEnabled ?? false

  const [step, setStep] = useState<WizardStep>('idle')
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [generatedBackupCodes, setGeneratedBackupCodes] = useState<string[] | null>(null)

  const [showEnableDialog, setShowEnableDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [showBackupDialog, setShowBackupDialog] = useState(false)
  const [dialogPassword, setDialogPassword] = useState('')
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [isSubmittingDialog, setIsSubmittingDialog] = useState(false)

  const { qrCodeSvg, generateQRCode, clearQRCode } = useQRCode()
  const {
    isVerifying,
    error,
    enableTwoFactor,
    verifyTotp,
    disableTwoFactor,
    generateBackupCodes: generateBackupCodesAction,
    clearError,
    clearStoredBackupCodes
  } = useTwoFactorSetup()

  // FIXME: React instrumentation encountered an error: Error: The children should not have changed if we pass in the same set.
  const resetWizard = useCallback(() => {
    setStep('idle')
    setTotpUri(null)
    setBackupCodes(null)
    clearQRCode()
    clearStoredBackupCodes()
    clearError()
  }, [clearQRCode, clearStoredBackupCodes, clearError])

  const handleEnableDialogClose = () => {
    if (!isSubmittingDialog) {
      setShowEnableDialog(false)
      setTimeout(() => {
        setDialogPassword('')
        setDialogError(null)
      }, 300)
    }
  }

  const handleEnableDialogSubmit = async () => {
    if (!dialogPassword.trim()) {
      setDialogError('Password is required')
      return
    }

    setIsSubmittingDialog(true)
    setDialogError(null)

    const result = await enableTwoFactor(dialogPassword)

    if (result.error || !result.data) {
      setDialogError(typeof result.error === 'string' ? result.error : 'Failed to enable 2FA')
      setIsSubmittingDialog(false)
      return
    }

    if (result.data.totpURI) {
      setTotpUri(result.data.totpURI)
    }

    setShowEnableDialog(false)
    setIsSubmittingDialog(false)
    setDialogPassword('')

    if (result.data.totpURI) {
      generateQRCode(result.data.totpURI)
    }
    setStep('setup')
  }

  const handleDisableDialogClose = () => {
    if (!isSubmittingDialog) {
      setShowDisableDialog(false)
      setTimeout(() => {
        setDialogPassword('')
        setDialogError(null)
      }, 300)
    }
  }

  const handleDisableDialogSubmit = async () => {
    if (!dialogPassword.trim()) {
      setDialogError('Password is required')
      return
    }

    setIsSubmittingDialog(true)
    setDialogError(null)

    const result = await disableTwoFactor(dialogPassword)

    if (result.error) {
      setDialogError(typeof result.error === 'string' ? result.error : 'Failed to disable 2FA')
      setIsSubmittingDialog(false)
      return
    }

    setShowDisableDialog(false)
    setIsSubmittingDialog(false)
    resetWizard()
    navigate({ to: '/account' })
  }

  const handleBackupDialogClose = () => {
    if (!isSubmittingDialog) {
      setShowBackupDialog(false)
      setTimeout(() => {
        setDialogPassword('')
        setDialogError(null)
      }, 300)
    }
  }

  const handleBackupDialogSubmit = async () => {
    if (!dialogPassword.trim()) {
      setDialogError('Password is required')
      return
    }

    setIsSubmittingDialog(true)
    setDialogError(null)

    const result = await generateBackupCodesAction(dialogPassword)

    if (result.error) {
      setDialogError(
        typeof result.error === 'string' ? result.error : 'Failed to generate backup codes'
      )
      setIsSubmittingDialog(false)
      return
    }

    if (result.data?.backupCodes) {
      setGeneratedBackupCodes(result.data.backupCodes)
    }

    setShowBackupDialog(false)
    setIsSubmittingDialog(false)
    setDialogPassword('')
  }

  const handleVerifyTotp = async (code: string) => {
    const result = await verifyTotp(code)
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

  // Cleanup effect: Ensure body scroll is restored when step changes
  const previousStep = useRef<WizardStep>('idle')
  useEffect(() => {
    if (step === 'idle' && previousStep.current !== 'idle') {
      // Force restore body scroll when returning to idle state from active wizard
      setTimeout(() => {
        document.body.style.removeProperty('overflow')
        document.body.style.removeProperty('padding-right')
      }, 0)
    }
    previousStep.current = step
  }, [step])

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
              <div className='flex gap-2'>
                <Dialog
                  open={showBackupDialog}
                  onOpenChange={setShowBackupDialog}
                  disablePointerDismissal
                >
                  <DialogTrigger render={<Button type='button' variant='outline' />}>
                    Generate Backup Codes
                  </DialogTrigger>
                </Dialog>

                <Dialog
                  open={showDisableDialog}
                  onOpenChange={setShowDisableDialog}
                  disablePointerDismissal
                >
                  <DialogTrigger render={<Button type='button' variant='danger' />}>
                    Disable 2FA
                  </DialogTrigger>
                </Dialog>
              </div>
            </Activity>

            <Activity mode={step === 'idle' && !twoFactorEnabled ? 'visible' : 'hidden'}>
              <Dialog
                open={showEnableDialog}
                onOpenChange={setShowEnableDialog}
                disablePointerDismissal
              >
                <DialogTrigger render={<Button type='button' variant='primary' />}>
                  Enable 2FA
                </DialogTrigger>
              </Dialog>
            </Activity>
          </CardHeaderAction>
        </div>
      </CardHeader>

      <CardBody className='pb-0'>
        {error && (
          <div className='p-4'>
            <Alert variant='danger'>
              <Lucide.AlertCircle className='size-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
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
                    <span className='font-medium'>Authenticator App</span>
                  </div>
                  <p className='text-on-background-neutral text-sm'>
                    Use an authenticator app for 2FA
                  </p>
                </div>
              </div>
              <Label>
                <Switch checked={twoFactorEnabled} readOnly className='cursor-default' />
                <span className='sr-only'>Authenticator App Enabled</span>
              </Label>
            </div>

            <div className='border-border-neutral-faded flex items-center justify-between rounded-lg border p-4 pr-5'>
              <div className='flex items-center gap-3'>
                <div className='bg-background-neutral-faded flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                  <Lucide.Mail />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>Email OTP</span>
                  </div>
                  <p className='text-on-background-neutral text-sm'>
                    Receive verification codes via email
                  </p>
                </div>
              </div>
              <Label>
                <Switch checked={twoFactorEnabled} readOnly className='cursor-default' />
                <span className='sr-only'>Email OTP Enabled</span>
              </Label>
            </div>
          </Activity>

          <Activity mode={step === 'setup' && totpUri ? 'visible' : 'hidden'}>
            <TwoFactorStepTOTP
              totpUri={totpUri || ''}
              qrCodeSvg={qrCodeSvg}
              isVerifying={isVerifying}
              onVerify={handleVerifyTotp}
              onCancel={resetWizard}
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

        <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog} disablePointerDismissal>
          <DialogTrigger />
          <DialogPopup>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='bg-background-primary-faded flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                  <Lucide.Shield className='text-foreground-primary h-5 w-5' />
                </div>
                <div>
                  <DialogTitle>Enable 2FA</DialogTitle>
                  <DialogDescription>
                    Add an extra layer of security to your account
                  </DialogDescription>
                </div>
              </div>
              <DialogClose
                className='ml-auto'
                onClick={handleEnableDialogClose}
                disabled={isSubmittingDialog}
              >
                <Lucide.XIcon className='size-4' strokeWidth={2.0} />
              </DialogClose>
            </DialogHeader>
            <DialogBody>
              {dialogError && (
                <div className='text-foreground-critical mt-4 text-sm'>{dialogError}</div>
              )}
              <Field>
                <Label htmlFor='enable-password'>Enter your password</Label>
                <InputPassword
                  id='enable-password'
                  value={dialogPassword}
                  onChange={(e) => {
                    setDialogPassword(e.target.value)
                    if (dialogError) setDialogError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && dialogPassword.trim() && !isSubmittingDialog) {
                      handleEnableDialogSubmit()
                    }
                  }}
                  disabled={isSubmittingDialog}
                  placeholder='Your password'
                  autoFocus
                />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button
                variant='primary'
                disabled={!dialogPassword.trim() || isSubmittingDialog}
                onClick={handleEnableDialogSubmit}
                block
              >
                {isSubmittingDialog ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Lucide.Loader2 className='size-4 animate-spin' />
                    Verifying...
                  </span>
                ) : (
                  'Continue'
                )}
              </Button>
            </DialogFooter>
          </DialogPopup>
        </Dialog>

        <Dialog
          open={showDisableDialog}
          onOpenChange={setShowDisableDialog}
          disablePointerDismissal
        >
          <DialogTrigger />
          <DialogPopup>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='bg-background-critical/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                  <Lucide.AlertTriangle className='text-foreground-critical h-5 w-5' />
                </div>
                <div>
                  <DialogTitle>Disable 2FA?</DialogTitle>
                  <DialogDescription>This action cannot be undone</DialogDescription>
                </div>
              </div>
              <DialogClose
                className='ml-auto'
                onClick={handleDisableDialogClose}
                disabled={isSubmittingDialog}
              >
                <Lucide.XIcon className='size-4' strokeWidth={2.0} />
              </DialogClose>
            </DialogHeader>
            <DialogBody>
              <Alert variant='danger' className='mb-4'>
                <Lucide.AlertTriangle className='size-4' />
                <AlertDescription>
                  <strong>Warning: This will reduce your account security</strong>
                  <br />
                  Disabling 2FA removes an important layer of protection. Your account will only be
                  protected by your password.
                </AlertDescription>
              </Alert>

              {dialogError && (
                <div className='text-foreground-critical mt-4 text-sm'>{dialogError}</div>
              )}

              <Field className='mt-4'>
                <Label htmlFor='disable-password'>Enter your password</Label>
                <InputPassword
                  id='disable-password'
                  value={dialogPassword}
                  onChange={(e) => {
                    setDialogPassword(e.target.value)
                    if (dialogError) setDialogError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && dialogPassword.trim() && !isSubmittingDialog) {
                      handleDisableDialogSubmit()
                    }
                  }}
                  disabled={isSubmittingDialog}
                  placeholder='Your password'
                  autoFocus
                />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button
                variant='danger'
                disabled={!dialogPassword.trim() || isSubmittingDialog}
                onClick={handleDisableDialogSubmit}
                block
              >
                {isSubmittingDialog ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Lucide.Loader2 className='size-4 animate-spin' />
                    Disabling...
                  </span>
                ) : (
                  'Disable 2FA'
                )}
              </Button>
            </DialogFooter>
          </DialogPopup>
        </Dialog>

        <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog} disablePointerDismissal>
          <DialogTrigger />
          <DialogPopup>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='bg-background-primary-faded flex h-10 w-10 shrink-0 items-center justify-center rounded-full'>
                  <Lucide.Key className='text-foreground-primary h-5 w-5' />
                </div>
                <div>
                  <DialogTitle>Generate Backup Codes</DialogTitle>
                  <DialogDescription>Create new recovery codes for your account</DialogDescription>
                </div>
              </div>
              <DialogClose
                className='ml-auto'
                onClick={handleBackupDialogClose}
                disabled={isSubmittingDialog}
              >
                <Lucide.XIcon className='size-4' strokeWidth={2.0} />
              </DialogClose>
            </DialogHeader>
            <DialogBody>
              <Alert variant='warning' className='mb-4'>
                <Lucide.AlertTriangle className='size-4' />
                <AlertDescription>
                  <strong>Your old codes will be invalidated</strong>
                  <br />
                  After generating new codes, your previous backup codes will no longer work. Make
                  sure to store the new codes in a safe place.
                </AlertDescription>
              </Alert>

              {dialogError && (
                <div className='text-foreground-critical mt-4 text-sm'>{dialogError}</div>
              )}
              <Field className='mt-4'>
                <Label htmlFor='backup-password'>Enter your password</Label>
                <InputPassword
                  id='backup-password'
                  value={dialogPassword}
                  onChange={(e) => {
                    setDialogPassword(e.target.value)
                    if (dialogError) setDialogError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && dialogPassword.trim() && !isSubmittingDialog) {
                      handleBackupDialogSubmit()
                    }
                  }}
                  disabled={isSubmittingDialog}
                  placeholder='Your password'
                  autoFocus
                />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button
                variant='primary'
                disabled={!dialogPassword.trim() || isSubmittingDialog}
                onClick={handleBackupDialogSubmit}
                block
              >
                {isSubmittingDialog ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Lucide.Loader2 className='size-4 animate-spin' />
                    Generating...
                  </span>
                ) : (
                  'Generate Codes'
                )}
              </Button>
            </DialogFooter>
          </DialogPopup>
        </Dialog>
      </CardBody>
    </Card>
  )
}
