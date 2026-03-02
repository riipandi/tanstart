import * as Lucide from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { clx } from '#/utils/variant'

interface TwoFactorStepOTPProps {
  onSendOtp: () => Promise<{ error: string | null; success: boolean }>
  onVerify: (code: string) => void
  onCancel: () => void
  isVerifying: boolean
  error: string | null
}

const RESEND_COUNTDOWN = 30

export function TwoFactorStepOTP({
  onSendOtp,
  onVerify,
  onCancel,
  isVerifying,
  error
}: TwoFactorStepOTPProps) {
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(true)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleResendOtp = useCallback(async () => {
    if (!canResend || countdown > 0) return

    setCanResend(false)
    setCountdown(RESEND_COUNTDOWN)

    const result = await onSendOtp()
    if (result.error) {
      setCanResend(true)
      setCountdown(0)
    }
  }, [canResend, countdown, onSendOtp])

  const handleVerify = () => {
    if (code.length === 6 && /^\d+$/.test(code)) {
      onVerify(code)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
  }

  return (
    <div className='border-border-neutral bg-background-elevation-base rounded-md border p-6'>
      <div className='mb-4 flex items-center gap-3'>
        <div className='bg-background-primary/10 flex h-12 w-12 items-center justify-center rounded-full'>
          <Lucide.Mail className='text-background-primary h-6 w-6' />
        </div>
        <div>
          <h3 className='text-base font-semibold'>Verify Email OTP</h3>
          <p className='text-on-background-neutral text-sm'>
            We've sent a 6-digit code to your email address
          </p>
        </div>
      </div>

      {error && (
        <div className='border-border-critical bg-background-critical-faded mb-4 border-l-4 px-3 py-2.5'>
          <p className='text-foreground-critical text-sm'>{error}</p>
        </div>
      )}

      <div className='space-y-4'>
        <div>
          <label
            htmlFor='otp-code'
            className='text-foreground-neutral mb-1.5 block text-sm font-medium'
          >
            Verification Code
          </label>
          <input
            id='otp-code'
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

        <button
          type='button'
          onClick={handleResendOtp}
          disabled={!canResend || countdown > 0}
          className='text-foreground-neutral flex items-center gap-1 text-sm font-medium transition-colors hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50'
        >
          <Lucide.RefreshCw
            className={clx('size-3.5', !canResend || countdown > 0 ? '' : 'animate-spin')}
          />
          Resend code {countdown > 0 && `(${countdown}s)`}
        </button>
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
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    </div>
  )
}
