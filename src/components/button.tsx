/**
 * A button component that can be rendered as another HTML tag while remaining keyboard accessible.
 *
 * @see: https://base-ui.com/react/components/button
 *
 * BaseUI Anatomy:
 * <Button />
 */

import { Button as BaseButton, type ButtonProps as BaseButtonProps } from '@base-ui/react/button'
import { clx, tv, type VariantProps } from '#/utils/variant'

export const buttonStyles = tv({
  base: [
    'relative cursor-pointer text-sm font-medium select-none',
    'inline-flex items-center justify-center gap-2 transition-colors',
    'after:absolute after:inset-0 after:bg-white/15 after:opacity-0 hover:not-data-disabled:after:opacity-100',
    'after:transition-opacity active:not-data-disabled:after:opacity-100 data-popup-open:after:opacity-100',
    'focus:outline-0 focus-visible:outline-2 focus-visible:outline-offset-2',
    'before:bg-spinner before:-mr-6 before:size-4 before:scale-20 before:opacity-0 before:transition-[opacity,scale,margin-right]',
    '[&>svg]:opacity-100 [&>svg]:transition-[opacity,scale,margin-right] [&>svg:not([class*=text-])]:text-current',
    'data-disabled:cursor-not-allowed data-disabled:opacity-70'
  ],
  variants: {
    variant: {
      primary: [
        'bg-background-primary text-on-background-primary ring-border-primary ring',
        'shadow inset-shadow-2xs inset-shadow-white/15',
        'outline-border-primary after:rounded'
      ],
      secondary: [
        'bg-background-neutral text-on-background-neutral ring-border-neutral ring',
        'inset-shadow-background-neutral/15 shadow',
        'hover:not-data-disabled:bg-background-neutral-faded focus-visible:outline-border-neutral after:rounded'
      ],
      danger: [
        'bg-background-critical text-on-background-critical ring-border-critical ring',
        'shadow inset-shadow-2xs inset-shadow-white/15',
        'outline-border-critical after:rounded'
      ],
      outline: [
        'text-foreground-neutral shadow',
        'ring-border-neutral hover:not-data-disabled:bg-background-neutral-faded data-popup-open:bg-background-neutral-faded active:not-data-disabled:bg-background-neutral-faded ring',
        'outline-border-neutral after:content-none'
      ],
      ghost: [
        'text-foreground-neutral hover:not-data-disabled:bg-background-neutral-faded data-popup-open:bg-background-neutral-faded active:not-data-disabled:bg-background-neutral-faded',
        'outline-border-neutral after:content-none'
      ]
    },
    size: {
      xs: 'h-6.5 gap-1 rounded-sm px-2 text-xs before:-mr-5 after:rounded-sm [&>svg:not([class*=size-])]:size-3.5',
      sm: 'h-8 rounded-sm px-2.5 text-sm after:rounded-sm [&>svg:not([class*=size-])]:size-4',
      md: 'h-9 rounded-sm px-3 text-sm [&>svg:not([class*=size-])]:size-4',
      lg: 'h-11 rounded-md px-4 text-base after:rounded-md [&>svg:not([class*=size-])]:size-4',
      xl: 'h-12 rounded-md px-5 text-base [&>svg:not([class*=size-])]:size-5'
    },
    mode: {
      icon: '',
      link: ''
    },
    pill: {
      true: 'rounded-full after:rounded-full'
    },
    block: {
      true: 'w-full'
    },
    progress: {
      true: [
        'pointer-events-none cursor-progress opacity-70 [&>svg]:-mr-7 [&>svg]:scale-0 [&>svg]:opacity-0',
        'before:bg-spinner before:mr-0 before:size-4.5 before:scale-100 before:animate-spin before:opacity-100'
      ]
    }
  },
  compoundVariants: [
    {
      mode: 'icon',
      size: 'xs',
      class: 'aspect-square w-6.5 p-1.5'
    },
    {
      mode: 'icon',
      size: 'sm',
      class: 'aspect-square w-8 p-2'
    },
    {
      mode: 'icon',
      size: 'md',
      class: 'aspect-square w-9 p-2'
    },
    {
      mode: 'icon',
      size: 'lg',
      class: 'aspect-square w-11 p-3'
    },
    {
      mode: 'icon',
      size: 'xl',
      class: 'aspect-square w-12 p-3.5'
    },
    {
      mode: 'link',
      size: 'xs',
      class: 'h-auto gap-1 px-0 after:content-none'
    },
    {
      mode: 'link',
      size: 'sm',
      class: 'h-auto gap-1.5 px-0 after:content-none'
    },
    {
      mode: 'link',
      size: 'md',
      class: 'h-auto gap-1.5 px-0 after:content-none'
    },
    {
      mode: 'link',
      size: 'lg',
      class: 'h-auto gap-2 px-0 after:content-none'
    },
    {
      mode: 'link',
      size: 'xl',
      class: 'h-auto gap-2 px-0 after:content-none'
    },
    {
      variant: 'secondary',
      progress: true,
      class: 'before:bg-spinner-dark'
    },
    {
      size: 'xs',
      progress: true,
      class: 'before:size-3.5 [&>svg]:-mr-5'
    },
    {
      size: 'sm',
      progress: true,
      class: 'before:size-4'
    }
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md'
  }
})

export type ButtonProps = BaseButtonProps & VariantProps<typeof buttonStyles>

export function Button({
  variant,
  size,
  mode,
  pill,
  progress,
  block,
  className,
  ...props
}: ButtonProps) {
  const styles = buttonStyles({ variant, size, mode, pill, progress, block })
  return (
    <BaseButton
      data-slot='button'
      data-size={size}
      data-mode={mode}
      className={clx(styles, className)}
      focusableWhenDisabled
      {...props}
    />
  )
}
