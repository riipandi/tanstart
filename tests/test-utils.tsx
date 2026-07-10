import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
  Outlet
} from '@tanstack/react-router'
import type { RouteComponent } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import React from 'react'

/**
 * Build a test router with code-based routes.
 * Each route in the array gets its own `createRoute` under a root `<Outlet />`.
 */
export function createTestRouter(
  routes: Array<{ path: string; component: React.ComponentType }>,
  opts?: { initialEntries?: string[]; context?: Record<string, unknown> }
) {
  const rootRoute = createRootRoute({
    component: () => <Outlet />
  })

  const children = routes.map((r) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: r.path,
      component: r.component as unknown as RouteComponent
    })
  )

  return createRouter({
    routeTree: rootRoute.addChildren(children),
    history: createMemoryHistory({
      initialEntries: opts?.initialEntries ?? ['/']
    }),
    context: opts?.context ?? {}
  })
}

/**
 * Render components inside RouterProvider + QueryClientProvider.
 *
 * RouterProvider mounts routes asynchronously, so assertions may need
 * `await waitFor(...)` or `await screen.findBy...()`.
 */
export function renderWithRouter(
  routes: Array<{ path: string; component: React.ComponentType }>,
  opts?: {
    initialEntries?: string[]
    context?: Record<string, unknown>
    renderOptions?: Omit<RenderOptions, 'wrapper'>
  }
) {
  const router = createTestRouter(routes, {
    initialEntries: opts?.initialEntries,
    context: opts?.context
  })

  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return {
    router,
    ...render(
      <QueryClientProvider client={qc}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
      opts?.renderOptions
    )
  }
}
