import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { extractSecretFromUri } from './two-factor-utils'
import { useCopyToClipboard } from './two-factor-utils'

interface TwoFactorStepTOTPProps {
  totpUri: string
  qrCodeSvg: string | null
  isVerifying: boolean
  onVerify: (code: string) => Promise<void>
  onCancel: () => void
}

export function TwoFactorStepTOTP({
  totpUri,
  qrCodeSvg,
  isVerifying,
  onVerify,
  onCancel
}: TwoFactorStepTOTPProps) {
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
    <div className='border-border-neutral bg-background-elevation-base rounded-md border p-6'>
      <h3 className='mb-4 text-center text-base font-semibold'>Set Up Authenticator App</h3>

      <div
        className='mb-6 flex justify-center'
        role='img'
        aria-label='QR Code for authenticator app setup'
      >
        {qrCodeSvg ? (
          <div
            className='rounded-md bg-white p-2'
            style={{ width: '200px', height: '200px' }}
            // eslint-disable-next-line react/no-danger -- SVG from trusted uqr library with server-generated TOTP URI
            dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
            data-qr-code='totp'
          />
        ) : (
          <div
            className='bg-background-neutral h-[200px] w-[200px] animate-pulse rounded-md'
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
        <div>
          <label
            htmlFor='secret-key'
            className='text-foreground-neutral mb-2 block text-sm font-medium'
          >
            Secret Key
          </label>
          <div className='flex gap-2'>
            <input
              id='secret-key'
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
              {copied ? (
                <Lucide.Check className='h-5 w-5 text-green-600' />
              ) : (
                <Lucide.Copy className='h-5 w-5' />
              )}
            </button>
          </div>
        </div>

        <div className='border-border-neutral bg-background-neutral rounded-md border p-4'>
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
      </div>

      <div className='mt-6 space-y-4'>
        <div>
          <label
            htmlFor='totp-verify-code'
            className='text-foreground-neutral mb-1.5 block text-sm font-medium'
          >
            Verification Code
          </label>
          <input
            id='totp-verify-code'
            type='text'
            inputMode='numeric'
            maxLength={6}
            autoComplete='one-time-code'
            value={code}
            onChange={handleCodeChange}
            className='border-border-neutral focus:ring-border-primary mt-1 block w-full rounded-md border px-3 py-2 text-center text-2xl tracking-[0.5em] focus:ring-2 focus:outline-none'
            placeholder='000000'
          />
        </div>
      </div>

      <div className='mt-6 flex justify-end gap-2'>
        <button
          type='button'
          onClick={onCancel}
          className='text-foreground-neutral text-sm font-medium transition-colors hover:underline'
        >
          Cancel
        </button>
        <button
          type='button'
          onClick={handleVerify}
          disabled={isVerifying || code.length !== 6}
          className='bg-background-primary hover:bg-background-primary/80 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isVerifying ? 'Verifying...' : 'Verify & Enable'}
        </button>
      </div>
    </div>
  )
}
