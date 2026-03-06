/**
 * A small status or label component for displaying contextual information.
 *
 * Anatomy:
 * <Badge />
 */

import { clx, tv, type VariantProps } from '#/utils/variant'

export const badgeStyles = tv({
  base: 'inline-flex items-center gap-2 border border-transparent',
  variants: {
    variant: {
      primary: 'bg-background-primary/15 text-foreground-primary',
      'primary-outline': 'border-border-primary text-foreground-primary',
      secondary: 'bg-background-neutral/15 text-foreground-neutral',
      'secondary-outline': 'border-border-neutral text-foreground-neutral',
      success: 'bg-background-positive/15 text-foreground-positive',
      'success-outline': 'border-border-positive text-foreground-positive',
      info: 'bg-background-primary/15 text-foreground-primary',
      'info-outline': 'border-border-primary text-foreground-primary',
      warning: 'bg-background-warning/15 text-foreground-warning',
      'warning-outline': 'border-border-warning text-foreground-warning',
      danger: 'bg-background-critical/15 text-foreground-critical',
      'danger-outline': 'border-border-critical text-foreground-critical'
    },
    size: {
      sm: 'h-4 rounded px-1 py-2 text-xs [&_svg:not([class*=size-])]:size-2.5',
      md: 'h-5 rounded px-2 py-2.5 text-sm [&_svg:not([class*=size-])]:size-3',
      lg: 'h-6 rounded-sm px-2 py-3 text-base [&_svg:not([class*=size-])]:size-4'
    },
    pill: {
      true: 'rounded-full'
    }
  },
  defaultVariants: {
    variant: 'secondary',
    size: 'md'
  }
})

export type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeStyles>

export function Badge({ variant, size, pill, className, ...props }: BadgeProps) {
  return (
    <span
      data-slot='badge'
      className={clx(badgeStyles({ variant, size, pill }), className)}
      {...props}
    />
  )
}
