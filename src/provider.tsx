import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { AnyRouteMatch } from '@tanstack/react-router'

export interface GlobalContext {
  queryClient: QueryClient
}

export type BreadcrumbValue = string | string[] | ((match: AnyRouteMatch) => string | string[])

export function getContext() {
  const queryClient = new QueryClient()
  return { queryClient }
}

export function RootProvider(props: React.PropsWithChildren<{ queryClient: QueryClient }>) {
  return <QueryClientProvider client={props.queryClient}>{props.children}</QueryClientProvider>
}
