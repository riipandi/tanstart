import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { Button } from '#/components/button'
import { Field } from '#/components/field'
import { Input } from '#/components/input'
import { InputGroup, InputGroupAddon } from '#/components/input-group'
import { Label } from '#/components/label'
import { extractSecretFromUri } from '#/hooks/use-two-factor'
import { useCopyToClipboard } from '#/hooks/use-two-factor'

interface TwoFactorStepSetupProps {
  totpUri: string
  qrCodeSvg: string | null
  isVerifying: boolean
  onVerify: (code: string) => Promise<void>
  onCancel: () => void
}

export function TwoFactorStepSetup({
  totpUri,
  qrCodeSvg,
  isVerifying,
  onVerify,
  onCancel
}: TwoFactorStepSetupProps) {
  const [code, setCode] = useState('')
  const secretKey = extractSecretFromUri(totpUri)
  const { copied, copyToClipboard } = useCopyToClipboard()

  const handleCopySecret = async () => {
    if (!secretKey) return
    await copyToClipboard(secretKey)
  }

  const handleVerify = async () => {
    if (code.length === 6 && /^\d+$/.test(code)) {
      await onVerify(code)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
  }

  return (
    <div className='p-4'>
      <h3 className='mb-4 text-center text-base font-semibold'>Set Up Authenticator App</h3>

      <div
        className='mb-6 flex justify-center'
        role='img'
        aria-label='QR Code for authenticator app setup'
      >
        {qrCodeSvg ? (
          <div
            className='bg-background-page border-border-neutral rounded-md border p-2'
            style={{ width: '200px', height: '200px' }}
            // eslint-disable-next-line react/no-danger -- SVG from trusted uqr library with server-generated TOTP URI
            dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
            data-qr-code='totp'
          />
        ) : (
          <div
            className='bg-background-neutral size-50 animate-pulse rounded-md'
            aria-hidden='true'
          />
        )}
      </div>

      <div className='border-border-neutral my-6 flex items-center gap-4'>
        <div className='h-px flex-1 border-t' />
        <span className='text-on-background-neutral text-xs uppercase'>Or enter manually</span>
        <div className='h-px flex-1 border-t' />
      </div>

      <div className='space-y-4'>
        <Field>
          <Label htmlFor='secret-key'>Secret Key</Label>
          <InputGroup className='w-full'>
            <Input
              id='secret-key'
              type='text'
              value={secretKey || ''}
              className='text-center text-xs font-medium'
              readOnly
            />
            <InputGroupAddon align='end'>
              <Button
                size='xs'
                variant='outline'
                onClick={handleCopySecret}
                disabled={!secretKey || copied}
              >
                {copied ? (
                  <Lucide.Check className='text-foreground-positive h-5 w-5' />
                ) : (
                  <Lucide.Copy className='h-5 w-5' />
                )}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <div className='border-border-neutral bg-background-neutral-faded rounded-md border p-4'>
          <h4 className='text-foreground-neutral mb-2 text-sm font-semibold'>
            How to add manually:
          </h4>
          <ol className='text-on-background-neutral list-decimal space-y-1 pl-4 text-sm'>
            <li>Open your authenticator app</li>
            <li>Select &quot;Enter manually&quot; or &quot;Add manually&quot;</li>
            <li>Copy the secret key above</li>
            <li>Paste it into your authenticator app</li>
            <li>Enter the verification code below</li>
          </ol>
        </div>

        <Field>
          <Label htmlFor='totp-verify-code'>Verification Code</Label>
          <InputGroup className='w-full'>
            <Input
              id='totp-verify-code'
              type='text'
              inputMode='numeric'
              maxLength={6}
              autoComplete='one-time-code'
              value={code}
              onChange={handleCodeChange}
              className='text-center text-xl tracking-widest'
              placeholder='000000'
            />
            <InputGroupAddon align='end'>
              <Button
                size='sm'
                variant='outline'
                onClick={handleVerify}
                disabled={isVerifying || code.length !== 6}
              >
                {isVerifying ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </div>

      <div className='mt-6 flex justify-end'>
        <Button size='xs' variant='ghost' onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function TwoFactorBackupCodes({ codes }: { codes: string[] }) {
  const { copied, copyToClipboard } = useCopyToClipboard()

  const handleCopy = async () => {
    const text = codes.join('\n')
    await copyToClipboard(text)
  }

  return (
    <div className='bg-background-warning-faded border-border-warning-faded mt-6 rounded-md border p-6'>
      <div className='mb-2 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Lucide.Shield className='text-foreground-warning size-4' />
          <h3 className='text-foreground-warning text-sm font-semibold'>Backup Codes</h3>
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handleCopy}
            disabled={copied}
            className='text-foreground-warning flex items-center gap-1 text-xs font-medium hover:underline disabled:cursor-not-allowed disabled:opacity-50'
            title={copied ? 'Copied!' : 'Copy all codes'}
          >
            {copied ? (
              <>
                <Lucide.Check className='h-3 w-3' />
                Copied!
              </>
            ) : (
              <>
                <Lucide.Copy className='h-3 w-3' />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      <p className='text-foreground-warning mb-4 text-sm'>
        Save these codes in a safe place. You can use them to access your account if you lose your
        authenticator.
      </p>
      <div className='grid grid-cols-3 gap-2 font-mono text-sm'>
        {codes.map((code) => (
          <span key={code} className='text-foreground-warning text-sm font-medium'>
            {code}
          </span>
        ))}
      </div>
    </div>
  )
}

interface TwoFactorStepSuccessProps {
  backupCodes: string[]
  onComplete: () => void
}

export function TwoFactorStepSuccess({ backupCodes, onComplete }: TwoFactorStepSuccessProps) {
  return (
    <div className='p-4'>
      <div className='mb-4 text-center'>
        <div className='bg-background-positive-faded mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
          <Lucide.CheckCircle2 className='text-foreground-positive h-10 w-10' />
        </div>
        <h3 className='mb-2 text-base font-semibold'>Two-Factor Authentication Enabled</h3>
        <p className='text-on-background-neutral text-sm'>
          Your account is now protected with an extra layer of security
        </p>
      </div>

      <TwoFactorBackupCodes codes={backupCodes} />

      <div className='mt-6 flex justify-end'>
        <button
          type='button'
          onClick={onComplete}
          className='bg-background-primary hover:bg-background-primary/80 focus-visible:bg-background-primary/90 text-on-background-primary focus-visible:ring-foreground-primary rounded-md px-6 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
        >
          Done
        </button>
      </div>
    </div>
  )
}
