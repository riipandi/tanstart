/**
 * Prompt dialog components for confirmation dialogs with optional verification.
 *
 * Anatomy:
 * <PromptDialog>
 *   <PromptDialogTrigger />
 *   <PromptDialogContent />
 * </PromptDialog>
 */

import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import * as React from 'react'
import { clx } from '#/utils/variant'
import { buttonStyles } from './button'
import { dialogStyles } from './dialog'
import { Input } from './input'
import { Label } from './label'

export interface PromptDialogRootProps extends React.ComponentProps<typeof BaseDialog.Root> {}

export interface PromptDialogTriggerProps extends React.ComponentProps<typeof BaseDialog.Trigger> {}

export interface PromptDialogPopupProps extends React.ComponentProps<typeof BaseDialog.Popup> {}

export interface PromptDialogHeaderProps extends React.ComponentProps<'header'> {}

export interface PromptDialogTitleProps extends React.ComponentProps<typeof BaseDialog.Title> {}

export interface PromptDialogBodyProps extends React.ComponentProps<'div'> {}

export interface PromptDialogDescriptionProps extends React.ComponentProps<
  typeof BaseDialog.Description
> {}

export interface PromptDialogFooterProps extends React.ComponentProps<'footer'> {}

export interface PromptDialogCloseProps extends BaseDialog.Close.Props {}

export interface PromptDialogContentProps {
  className?: string
  title: string
  description: React.ReactNode
  variant?: 'danger' | 'confirmation'
  verificationText?: string
  verificationInstruction?: string
  cancelText?: string
  confirmText?: string
  onConfirm: () => void
  onCancel?: () => void
}

export function PromptDialog({ ...props }: PromptDialogRootProps) {
  return <BaseDialog.Root data-slot='prompt-dialog' {...props} />
}

export function PromptDialogTrigger({ children, ...props }: PromptDialogTriggerProps) {
  return (
    <BaseDialog.Trigger data-slot='prompt-dialog-trigger' {...props}>
      {children}
    </BaseDialog.Trigger>
  )
}

export function PromptDialogPopup({ className, children, ...props }: PromptDialogPopupProps) {
  const styles = dialogStyles()
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={styles.backdrop()} />
      <BaseDialog.Popup
        data-slot='prompt-dialog-popup'
        className={clx(styles.popup(), className)}
        {...props}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  )
}

export function PromptDialogHeader({ className, children, ...props }: PromptDialogHeaderProps) {
  const styles = dialogStyles()
  return (
    <header data-slot='prompt-dialog-header' {...props} className={styles.header({ className })}>
      {children}
    </header>
  )
}

export function PromptDialogTitle({ className, children, ...props }: PromptDialogTitleProps) {
  return (
    <BaseDialog.Title
      data-slot='prompt-dialog-title'
      className={clx('text-lg font-semibold', className)}
      {...props}
    >
      {children}
    </BaseDialog.Title>
  )
}

export function PromptDialogBody({ className, children, ...props }: PromptDialogBodyProps) {
  const styles = dialogStyles()
  return (
    <div data-slot='prompt-dialog-body' {...props} className={styles.body({ className })}>
      {children}
    </div>
  )
}

export function PromptDialogDescription({
  className,
  children,
  ...props
}: PromptDialogDescriptionProps) {
  const styles = dialogStyles()
  return (
    <BaseDialog.Description
      data-slot='prompt-dialog-description'
      {...props}
      className={clx(styles.description(), className)}
    >
      {children}
    </BaseDialog.Description>
  )
}

export function PromptDialogFooter({ className, children, ...props }: PromptDialogFooterProps) {
  const styles = dialogStyles()
  return (
    <footer data-slot='prompt-dialog-footer' {...props} className={styles.footer({ className })}>
      {children}
    </footer>
  )
}

export function PromptDialogClose({
  className,
  children,
  render,
  ...props
}: PromptDialogCloseProps) {
  const styles = buttonStyles({ variant: 'ghost' })
  return (
    <BaseDialog.Close
      data-slot='prompt-dialog-close'
      render={render}
      {...props}
      className={clx(!render && styles, className)}
    >
      {children}
    </BaseDialog.Close>
  )
}

export function PromptDialogContent({
  className,
  variant = 'confirmation',
  title,
  description,
  verificationText,
  verificationInstruction = 'Please type {val} to confirm:',
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  onConfirm,
  onCancel
}: PromptDialogContentProps) {
  const [userInput, setUserInput] = React.useState('')

  const validInput = !verificationText || userInput === verificationText

  const instructionParts = React.useMemo(() => {
    if (verificationInstruction.includes('{val}')) {
      const parts = verificationInstruction.split('{val}')
      if (parts.length === 2) return parts
    }
    return ['Please type', 'to confirm:']
  }, [verificationInstruction])

  const handleConfirm = () => {
    onConfirm()
    setUserInput('')
  }

  const handleCancel = () => {
    onCancel?.()
    setUserInput('')
  }

  return (
    <PromptDialogPopup className={className}>
      <PromptDialogHeader>
        <PromptDialogTitle>{title}</PromptDialogTitle>
      </PromptDialogHeader>
      <PromptDialogBody>
        <PromptDialogDescription>{description}</PromptDialogDescription>
        <React.Activity mode={verificationText ? 'visible' : 'hidden'}>
          <div className='mt-2 flex flex-col gap-2'>
            <Label htmlFor='verificationText' className='text-sm'>
              {instructionParts[0]} <span className='font-semibold'>{verificationText}</span>{' '}
              {instructionParts[1]}
            </Label>
            <Input
              autoFocus
              autoComplete='off'
              id='verificationText'
              placeholder={verificationText}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </div>
        </React.Activity>
      </PromptDialogBody>
      <PromptDialogFooter>
        <PromptDialogClose
          render={<button type='button' className={buttonStyles({ variant: 'ghost' })} />}
          onClick={handleCancel}
        >
          {cancelText}
        </PromptDialogClose>
        <PromptDialogClose
          disabled={!validInput}
          render={
            <button
              type='button'
              className={buttonStyles({ variant: variant === 'danger' ? 'danger' : 'primary' })}
            />
          }
          onClick={handleConfirm}
        >
          {confirmText}
        </PromptDialogClose>
      </PromptDialogFooter>
    </PromptDialogPopup>
  )
}
