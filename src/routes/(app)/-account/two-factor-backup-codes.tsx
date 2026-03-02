import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { useCopyToClipboard } from '#/hooks/use-two-factor'

interface TwoFactorBackupCodesProps {
  codes: string[]
  onHide?: () => void
}

export function TwoFactorBackupCodes({ codes, onHide }: TwoFactorBackupCodesProps) {
  const [visible, setVisible] = useState(true)
  const { copied, copyToClipboard } = useCopyToClipboard()

  const handleCopyAll = async () => {
    const text = codes.join('\n')
    await copyToClipboard(text)
  }

  const handleToggleVisibility = () => {
    setVisible(!visible)
  }

  return (
    <div className='mt-6 rounded-md bg-yellow-50 p-4'>
      <div className='mb-2 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Lucide.Shield className='h-4 w-4 text-yellow-800' />
          <h3 className='text-sm font-semibold text-yellow-800'>Backup Codes</h3>
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handleCopyAll}
            disabled={copied || !visible}
            className='flex items-center gap-1 text-xs font-medium text-yellow-800 hover:underline disabled:cursor-not-allowed disabled:opacity-50'
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
                Copy all
              </>
            )}
          </button>
        </div>
      </div>
      <p className='mb-3 text-xs text-yellow-700'>
        Save these codes in a safe place. You can use them to access your account if you lose your
        authenticator.
      </p>
      <div className='grid grid-cols-2 gap-2 font-mono text-sm'>
        {visible
          ? codes.map((code) => (
              <span key={code} className='text-yellow-800'>
                {code}
              </span>
            ))
          : codes.map((code) => (
              <span key={code} className='text-yellow-800 blur-sm select-none'>
                {code.replace(/./g, '•')}
              </span>
            ))}
      </div>
      <div className='mt-3 flex items-center justify-between'>
        <button
          type='button'
          onClick={handleToggleVisibility}
          className='flex items-center gap-1 text-xs font-medium text-yellow-800 hover:underline'
        >
          {visible ? (
            <>
              <Lucide.EyeOff className='h-3 w-3' />
              Hide codes
            </>
          ) : (
            <>
              <Lucide.Eye className='h-3 w-3' />
              Show codes
            </>
          )}
        </button>
        {onHide && (
          <button
            type='button'
            onClick={onHide}
            className='flex items-center gap-1 text-xs font-medium text-yellow-800 hover:underline'
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}
