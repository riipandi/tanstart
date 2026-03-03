interface TwoFactorBackupPasswordProps {
  password: string
  onPasswordChange: (password: string) => void
  onSubmit: () => void
  isVerifying: boolean
  onCancel: () => void
}

export function TwoFactorBackupPassword({
  password,
  onPasswordChange,
  onSubmit,
  isVerifying,
  onCancel
}: TwoFactorBackupPasswordProps) {
  return (
    <div className='border-border-neutral bg-background-elevation-base rounded-md border p-4'>
      <h3 className='mb-3 text-sm font-semibold'>Generate New Backup Codes</h3>
      <p className='text-on-background-neutral mb-4 text-sm'>
        Enter your password to generate new backup codes. Your old codes will be invalidated.
      </p>
      <div className='mb-4'>
        <label
          htmlFor='backup-password'
          className='text-foreground-neutral mb-1.5 block text-sm font-medium'
        >
          Password
        </label>
        <input
          id='backup-password'
          type='password'
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className='border-border-neutral focus:ring-border-primary mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none'
          placeholder='Enter your password'
        />
      </div>
      <div className='flex gap-2'>
        <button
          type='button'
          onClick={onSubmit}
          disabled={isVerifying || !password}
          className='bg-background-primary hover:bg-background-primary/80 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isVerifying ? 'Generating...' : 'Generate'}
        </button>
        <button
          type='button'
          onClick={onCancel}
          className='text-foreground-neutral text-sm font-medium transition-colors hover:underline'
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
