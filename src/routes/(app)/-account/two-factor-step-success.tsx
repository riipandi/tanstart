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
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
          <Lucide.CheckCircle2 className='h-10 w-10 text-green-600' />
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
          className='bg-background-primary hover:bg-background-primary/80 rounded-md px-6 py-2 text-sm font-medium text-white transition-colors'
        >
          Done
        </button>
      </div>
    </div>
  )
}
