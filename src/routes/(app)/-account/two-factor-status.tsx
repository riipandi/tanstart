import * as Lucide from 'lucide-react'

interface TwoFactorStatusProps {
  enabled: boolean
}

export function TwoFactorStatus({ enabled }: TwoFactorStatusProps) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {enabled ? (
        <>
          <Lucide.CheckCircle2 className='h-3.5 w-3.5' />
          Enabled
        </>
      ) : (
        <>
          <Lucide.XCircle className='h-3.5 w-3.5' />
          Disabled
        </>
      )}
    </div>
  )
}
