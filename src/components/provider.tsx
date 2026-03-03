/**
 * Context provider for managing CSP and direction settings across the application.
 *
 * @see: https://base-ui.com/react/utils/csp-provider
 * @see: https://base-ui.com/react/utils/direction-provider
 *
 * Anatomy:
 * <UIProvider>
 *   {children}
 * </UIProvider>
 */

import { CSPProvider, type CSPProviderProps } from '@base-ui/react/csp-provider'
import { DirectionProvider } from '@base-ui/react/direction-provider'
import type { DirectionProviderProps, TextDirection } from '@base-ui/react/direction-provider'
import { ThemeProvider as LonikThemer } from '@lonik/themer'
import { Toast, type ToastProps } from './toast'

export interface UIProviderProps
  extends Omit<CSPProviderProps, 'children'>, Omit<DirectionProviderProps, 'children'> {
  children: React.ReactNode
  direction?: TextDirection
  toast?: Omit<ToastProps, 'children'>
}

export function UIProvider(props: UIProviderProps) {
  return (
    <CSPProvider nonce={props.nonce} disableStyleElements={props.disableStyleElements}>
      <DirectionProvider direction={props.direction}>{props.children}</DirectionProvider>
      <Toast {...props.toast} />
    </CSPProvider>
  )
}

export function ThemeProvider(props: React.PropsWithChildren) {
  return (
    <LonikThemer
      themes={['light', 'dark']}
      attribute='data-theme'
      defaultTheme='system'
      disableTransitionOnChange={true}
      enableColorScheme={false}
      enableSystem={true}
      storage='cookie'
    >
      {props.children}
    </LonikThemer>
  )
}
