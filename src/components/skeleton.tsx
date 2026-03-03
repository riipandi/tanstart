import * as React from 'react'
import { clx } from '#/utils/variant'

export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='skeleton'
      className={clx('bg-background-primary-faded animate-pulse rounded-lg', className)}
      {...props}
    />
  )
}
