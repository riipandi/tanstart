/**
 * A dialog that slides in from the edge of the screen.
 *
 * @see: https://base-ui.com/react/components/dialog
 *
 * Anatomy:
 * <Sheet.Root>
 *   <Sheet.Trigger />
 *   <Sheet.Portal>
 *     <Sheet.Backdrop />
 *     <Sheet.Content>
 *       <Sheet.Header>
 *         <Sheet.Title />
 *       </Sheet.Header>
 *       <Sheet.Body />
 *       <Sheet.Footer>
 *         <Sheet.Action />
 *         <Sheet.Close />
 *       </Sheet.Footer>
 *     </Sheet.Content>
 *   </Sheet.Portal>
 * </Sheet.Root>
 */

import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { clx, tv, type VariantProps } from '#/utils/variant'
import { buttonStyles } from './button'

export const sheetStyles = tv({
  base: '',
  slots: {
    backdrop: [
      'fixed inset-0 min-h-dvh bg-black/20 transition-[color,opacity] [--backdrop-opacity:0.5] [--bleed:3rem]',
      'data-open:animate-in data-closed:animate-out supports-backdrop-filter:backdrop-blur-3xl',
      'data-open:fade-in-0 data-closed:fade-out-0 data-closed:animation-duration-[300ms]'
    ],
    content: [
      'bg-background-elevation-overlay border-border-neutral fixed z-50 flex flex-col',
      'data-open:animate-in data-closed:animate-out gap-4 shadow',
      'transition ease-in-out data-closed:duration-300 data-open:duration-500'
    ],
    header: 'flex flex-col gap-2 p-4',
    body: 'px-4 py-3',
    footer: ['flex flex-col-reverse p-4 sm:flex-row sm:justify-end sm:space-x-2'],
    title: 'text-foreground-neutral font-semibold',
    description: 'text-foreground-neutral-faded-foreground text-sm',
    close: [
      'ring-offset-background-page focus:ring-border-neutral data-open:bg-background-neutral',
      'absolute top-4 right-4 rounded-xs opacity-70',
      'transition-opacity hover:opacity-100',
      'focus:ring-2 focus:ring-offset-2 focus:outline-hidden',
      'disabled:pointer-events-none'
    ]
  },
  variants: {
    side: {
      right: {
        content: [
          'data-closed:slide-out-to-right data-open:slide-in-from-right',
          'inset-y-0 right-0 h-full w-3/4 rounded-l-xl border-l sm:max-w-sm'
        ]
      },
      left: {
        content: [
          'data-closed:slide-out-to-left data-open:slide-in-from-left',
          'inset-y-0 left-0 h-full w-3/4 rounded-r-xl border-r sm:max-w-sm'
        ]
      },
      top: {
        content: [
          'data-closed:slide-out-to-top data-open:slide-in-from-top',
          'inset-x-0 top-0 h-auto rounded-b-xl border-b'
        ]
      },
      bottom: {
        content: [
          'data-closed:slide-out-to-bottom data-open:slide-in-from-bottom',
          'inset-x-0 bottom-0 h-auto rounded-t-xl border-t'
        ]
      }
    }
  },
  defaultVariants: {
    side: 'right'
  }
})

export type SheetRootProps = React.ComponentProps<typeof BaseDialog.Root>
export type SheetTriggerProps = React.ComponentProps<typeof BaseDialog.Trigger>
export type SheetCloseProps = React.ComponentProps<typeof BaseDialog.Close> & {
  block?: boolean
}
export type SheetActionProps = React.ComponentProps<typeof BaseDialog.Close> & {
  block?: boolean
}
export type SheetContentProps = React.ComponentProps<typeof BaseDialog.Popup> &
  VariantProps<typeof sheetStyles>
export type SheetHeaderProps = React.ComponentProps<'div'>
export type SheetBodyProps = React.ComponentProps<'div'>
export type SheetFooterProps = React.ComponentProps<'div'>
export type SheetTitleProps = React.ComponentProps<typeof BaseDialog.Title>
export type SheetDescriptionProps = React.ComponentProps<typeof BaseDialog.Description>

export function Sheet({ ...props }: SheetRootProps) {
  return <BaseDialog.Root data-slot='sheet' {...props} />
}

export function SheetTrigger({ children, ...props }: SheetTriggerProps) {
  return (
    <BaseDialog.Trigger data-slot='sheet-trigger' {...props}>
      {children}
    </BaseDialog.Trigger>
  )
}

export function SheetClose({ className, block = false, render, ...props }: SheetCloseProps) {
  const styles = buttonStyles({ variant: 'outline', block })
  return (
    <BaseDialog.Close
      data-slot='sheet-close'
      render={render}
      className={clx(!render && styles, className)}
      {...props}
    />
  )
}

export function SheetAction({ className, block = false, render, ...props }: SheetActionProps) {
  const styles = buttonStyles({ block })
  return (
    <BaseDialog.Close
      data-slot='sheet-action'
      render={render}
      className={clx(!render && styles, className)}
      {...props}
    />
  )
}

function SheetPortal({ ...props }: React.ComponentProps<typeof BaseDialog.Portal>) {
  return <BaseDialog.Portal data-slot='sheet-portal' {...props} />
}

function SheetBackdrop({ className, ...props }: React.ComponentProps<typeof BaseDialog.Backdrop>) {
  const styles = sheetStyles()
  return (
    <BaseDialog.Backdrop
      data-slot='sheet-overlay'
      className={clx(styles.backdrop(), className)}
      {...props}
    />
  )
}

export function SheetContent({ className, children, side = 'right', ...props }: SheetContentProps) {
  const styles = sheetStyles({ side })
  return (
    <SheetPortal>
      <SheetBackdrop />
      <BaseDialog.Popup
        data-slot='sheet-content'
        className={clx(styles.content(), className)}
        {...props}
      >
        {children}
        <BaseDialog.Close className={styles.close()}>
          <Lucide.XIcon className='size-4' />
          <span className='sr-only'>Close</span>
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </SheetPortal>
  )
}

export function SheetHeader({ className, children, ...props }: SheetHeaderProps) {
  const styles = sheetStyles()
  return (
    <div data-slot='sheet-header' className={styles.header({ className })} {...props}>
      {children}
    </div>
  )
}

export function SheetBody({ className, children, ...props }: SheetBodyProps) {
  const styles = sheetStyles()
  return (
    <div data-slot='sheet-body' className={styles.body({ className })} {...props}>
      {children}
    </div>
  )
}

export function SheetFooter({ className, children, ...props }: SheetFooterProps) {
  const styles = sheetStyles()
  return (
    <div data-slot='sheet-footer' className={styles.footer({ className })} {...props}>
      {children}
    </div>
  )
}

export function SheetTitle({ className, children, ...props }: SheetTitleProps) {
  const styles = sheetStyles()
  return (
    <BaseDialog.Title data-slot='sheet-title' className={clx(styles.title(), className)} {...props}>
      {children}
    </BaseDialog.Title>
  )
}

export function SheetDescription({ className, children, ...props }: SheetDescriptionProps) {
  const styles = sheetStyles()
  return (
    <BaseDialog.Description
      data-slot='sheet-description'
      className={clx(styles.description(), className)}
      {...props}
    >
      {children}
    </BaseDialog.Description>
  )
}
