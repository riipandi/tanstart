import * as Lucide from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { Alert, AlertDescription } from '#/components/alert'
import { Button } from '#/components/button'
import { Field } from '#/components/field'
import { Input } from '#/components/input'
import { InputGroup, InputGroupAddon } from '#/components/input-group'
import { Label } from '#/components/label'

interface TwoFactorStepOTPProps {
  onSendOtp: () => Promise<{ error: string | null; success: boolean }>
  onVerify: (code: string) => void
  onCancel: () => void
  isVerifying: boolean
  error: string | null
  setError: (val: string | null) => void
}

const RESEND_COUNTDOWN = import.meta.env.DEV ? 10 : 30

export function TwoFactorStepOTP({
  onSendOtp,
  onVerify,
  onCancel,
  setError,
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
    setError(null)

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
    <div className='p-4'>
      {!error && (
        <Alert variant='info' className='mb-6'>
          <Lucide.Mail className='text-background-primary size-4' />
          <AlertDescription>We've sent a 6-digit code to your email address</AlertDescription>
        </Alert>
      )}

      <div className='space-y-4'>
        <Field>
          <Label htmlFor='otp-code'>Verification Code</Label>
          <InputGroup className='w-full'>
            <Input
              id='otp-code'
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
                {isVerifying ? 'Verifying...' : 'Verify Code'}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <div className='flex justify-between'>
          <Button
            size='xs'
            variant='ghost'
            onClick={handleResendOtp}
            disabled={!canResend || countdown > 0}
          >
            Resend code {countdown > 0 && `(${countdown}s)`}
          </Button>

          <Button size='xs' variant='ghost' onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
