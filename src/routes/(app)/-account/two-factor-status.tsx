import * as Lucide from 'lucide-react'
import { clx } from '#/utils/variant'

interface TwoFactorStatusProps {
  enabled: boolean
}

export function TwoFactorStatus({ enabled }: TwoFactorStatusProps) {
  return (
    <div
      className={clx(
        'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        enabled
          ? 'bg-background-positive-faded text-foreground-positive'
          : 'bg-background-neutral-faded text-foreground-neutral'
      )}
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
