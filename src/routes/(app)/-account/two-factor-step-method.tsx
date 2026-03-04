import * as Lucide from 'lucide-react'
import { Button } from '#/components/button'

interface TwoFactorMethodSelectionProps {
  onSelectMethod: (method: 'totp' | 'otp') => void
  onCancel: () => void
}

export function TwoFactorMethodSelection({
  onSelectMethod,
  onCancel
}: TwoFactorMethodSelectionProps) {
  return (
    <div className='p-4'>
      <h3 className='mb-2 text-center text-base font-semibold'>Choose Verification Method</h3>
      <p className='text-on-background-neutral mb-6 text-center text-sm'>
        Select how you want to receive verification codes
      </p>

      <div className='grid gap-4'>
        <button
          type='button'
          onClick={() => onSelectMethod('totp')}
          className='border-border-neutral hover:border-background-primary hover:bg-background-primary/5 group flex items-center gap-4 rounded-lg border p-4 text-left transition-all'
        >
          <div className='bg-background-primary/10 group-hover:bg-background-primary/20 flex h-12 w-12 items-center justify-center rounded-lg transition-colors'>
            <Lucide.Smartphone className='text-background-primary h-6 w-6' />
          </div>
          <div className='flex-1'>
            <h4 className='font-semibold'>Authenticator App</h4>
            <p className='text-on-background-neutral text-sm'>
              Use an app like Google Authenticator or Authy
            </p>
          </div>
          <Lucide.ChevronRight className='text-foreground-neutral-faded h-5 w-5' />
        </button>

        <button
          type='button'
          onClick={() => onSelectMethod('otp')}
          className='border-border-neutral hover:border-background-primary hover:bg-background-primary/5 group flex items-center gap-4 rounded-lg border p-4 text-left transition-all'
        >
          <div className='bg-background-primary/10 group-hover:bg-background-primary/20 flex h-12 w-12 items-center justify-center rounded-lg transition-colors'>
            <Lucide.Mail className='text-background-primary h-6 w-6' />
          </div>
          <div className='flex-1'>
            <h4 className='font-semibold'>Email OTP</h4>
            <p className='text-on-background-neutral text-sm'>Receive a code via email</p>
          </div>
          <Lucide.ChevronRight className='text-foreground-neutral-faded h-5 w-5' />
        </button>
      </div>

      <div className='mt-6 flex justify-end'>
        <Button variant='outline' onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
