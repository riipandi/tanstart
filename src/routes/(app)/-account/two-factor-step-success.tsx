import * as Lucide from 'lucide-react'
import { TwoFactorBackupCodes } from './two-factor-backup-codes'

interface TwoFactorStepSuccessProps {
  backupCodes: string[]
  onComplete: () => void
}

export function TwoFactorStepSuccess({ backupCodes, onComplete }: TwoFactorStepSuccessProps) {
  return (
    <div className='border-border-neutral bg-background-elevation-base rounded-md border p-6'>
      <div className='mb-6 text-center'>
        <div className='bg-background-positive-faded mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
          <Lucide.CheckCircle2 className='text-foreground-positive h-10 w-10' />
        </div>
        <h3 className='mb-2 text-base font-semibold'>Two-Factor Authentication Enabled</h3>
        <p className='text-on-background-neutral text-sm'>
          Your account is now protected with an extra layer of security
        </p>
      </div>

      <TwoFactorBackupCodes codes={backupCodes} onHide={() => {}} />

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
