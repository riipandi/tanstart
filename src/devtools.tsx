import { TanStackDevtools, type TanStackDevtoolsReactInit } from '@tanstack/react-devtools'
import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

interface DevToolsProps {
  queryClient: QueryClient
}

export function AppDevTools({ queryClient }: DevToolsProps) {
  // Define and configure TanStack DevTools with some plugins
  const devToolsOptions: Partial<TanStackDevtoolsReactInit> = {
    config: {
      position: 'bottom-left',
      panelLocation: 'bottom',
      inspectHotkey: ['Alt', 'CtrlOrMeta'],
      openHotkey: ['Shift', 'D'],
      triggerHidden: true,
      requireUrlFlag: false,
      urlFlag: 'devtools',
      theme: 'dark'
    },
    plugins: [
      {
        name: 'TanStack Query',
        render: <ReactQueryDevtoolsPanel client={queryClient} theme='dark' />,
        defaultOpen: true
      },
      {
        name: 'TanStack Router',
        render: <TanStackRouterDevtoolsPanel />,
        defaultOpen: false
      }
    ]
  }

  return <TanStackDevtools {...devToolsOptions} />
}
