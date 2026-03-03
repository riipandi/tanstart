import { mergeProps, useRender } from '@base-ui/react'
import { Button as BaseButton } from '@base-ui/react/button'
import clipboard from 'clipboardy'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { tv, type VariantProps } from '#/utils/variant'
import { Tooltip, TooltipPopup, TooltipTrigger } from './tooltip'

const copyButtonStyles = tv({
  slots: {
    root: [
      'inline-flex h-fit w-fit items-center justify-center transition-colors',
      'cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'
    ],
    icon: 'text-foreground-neutral-faded'
  },
  variants: {
    variant: {
      default: {
        icon: 'size-4'
      },
      mini: {
        icon: 'size-3'
      }
    },
    done: {
      true: {},
      false: {}
    }
  },
  defaultVariants: {
    variant: 'default',
    done: false
  }
})

type CopyButtonStyles = VariantProps<typeof copyButtonStyles>

type CopyProps = React.HTMLAttributes<HTMLButtonElement> &
  CopyButtonStyles & {
    content: string
    render?: React.ReactElement
    copiedMessage?: string
    copyMessage?: string
  }

export function Copy({
  content,
  variant = 'default',
  className,
  children,
  render,
  copiedMessage = 'Copied',
  copyMessage = 'Copy',
  ...props
}: CopyProps) {
  const [done, setDone] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleCopy = async (
    e: React.MouseEvent<HTMLElement, MouseEvent> | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation()
    setDone(true)
    try {
      await clipboard.write(content)
    } catch {
      // fallback: do nothing
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDone(false), 2000)
  }

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const styles = copyButtonStyles({ variant, done })

  // Render logic
  const defaultProps = {
    type: 'button' as const,
    'aria-label': 'Copy code snippet',
    className: styles.root({ className }),
    onClick: handleCopy,
    ...props
  }

  const renderElement = React.isValidElement(children)
    ? (children as React.ReactElement)
    : render || <BaseButton />

  const finalProps = React.isValidElement(children)
    ? mergeProps(defaultProps, props)
    : mergeProps(defaultProps, { ...props, children })

  // Icon logic with Lucide
  let icon = null
  if (children) {
    icon = children
  } else if (done) {
    icon = <Lucide.CheckCircle className={styles.icon()} />
  } else {
    icon = <Lucide.Copy className={styles.icon()} />
  }

  // Tooltip text is derived from done state and custom messages
  const tooltipText = done ? copiedMessage : copyMessage

  return (
    <Tooltip open={done || open} onOpenChange={setOpen}>
      <TooltipTrigger
        render={useRender({
          render: renderElement,
          props: { ...finalProps, children: icon }
        })}
      />
      <TooltipPopup>{tooltipText}</TooltipPopup>
    </Tooltip>
  )
}
