import * as Lucide from 'lucide-react'
import { useCopyToClipboard } from '#/hooks/use-two-factor'

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
