/**
 * A prominent alert component for displaying important messages.
 *
 * Anatomy:
 * <Alert>
 *   <AlertTitle />
 *   <AlertDescription />
 *   <AlertAction />
 * </Alert>
 */

import * as React from 'react'
import { tv, type VariantProps } from '#/utils/variant'

export const alertStyles = tv({
  base: [
    'min-h-10 w-full rounded-md px-3 py-2 text-sm font-normal',
    '[&_svg:not([class*=size-])]:size-4 *:[svg]:shrink-0',
    'text-foreground-neutral flex items-center gap-2',
    'has-[>[data-slot=alert-description]]:grid',
    'has-[>[data-slot=alert-description]]:py-2',
    'has-[>svg]:grid-cols-[calc(var(--spacing)*4.5)_1fr_auto]',
    'not-[:has(>svg)]:grid-cols-[1fr_auto]',
    'not-[:has(>svg)]:*:data-[slot=alert-description]:col-start-1'
  ],
  slots: {
    title: 'pt-0.5 text-sm font-medium tracking-tight',
    description: 'text-foreground-neutral-faded col-start-2 pt-0.5 pb-1 text-xs leading-normal',
    action: 'col-start-3 row-span-2 row-start-1 ml-auto flex items-center gap-2 self-center'
  },
  variants: {
    variant: {
      primary:
        'bg-background-primary/7 ring-border-primary/30 [&_svg:not([class*=text-])]:text-foreground-primary ring',
      default: 'bg-background-page ring-border-neutral ring',
      danger:
        'bg-background-critical/7 ring-border-critical/30 [&_svg:not([class*=text-])]:text-foreground-critical ring',
      info: 'bg-background-primary/7 ring-border-primary/30 [&_svg:not([class*=text-])]:text-foreground-primary ring',
      success:
        'bg-background-positive/7 ring-border-positive/30 [&_svg:not([class*=text-])]:text-foreground-positive ring',
      warning:
        'bg-background-warning/7 ring-border-warning/30 [&_svg:not([class*=text-])]:text-foreground-warning ring',
      secondary:
        'bg-background-neutral/5 ring-border-neutral [&_svg:not([class*=text-])]:text-foreground-neutral ring'
    }
  },
  defaultVariants: {
    variant: 'primary'
  }
})

export type AlertProps = React.ComponentProps<'div'> & VariantProps<typeof alertStyles>
export type AlertTitleProps = React.ComponentProps<'div'>
export type AlertDescriptionProps = React.ComponentProps<'div'>
export type AlertActionProps = React.ComponentProps<'div'>

export function Alert({ className, variant, ...props }: AlertProps) {
  const styles = alertStyles({ variant })
  return <div data-slot='alert' className={styles.base({ className })} {...props} />
}

export function AlertTitle({ className, ...props }: AlertTitleProps) {
  const styles = alertStyles()
  return <div data-slot='alert-title' className={styles.title({ className })} {...props} />
}

export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  const styles = alertStyles()
  return (
    <div data-slot='alert-description' className={styles.description({ className })} {...props} />
  )
}

export function AlertAction({ className, ...props }: AlertActionProps) {
  const styles = alertStyles()
  return <div data-slot='alert-action' className={styles.action({ className })} {...props} />
}
