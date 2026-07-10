import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@tanstack/react-router', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router')
  return { ...actual, HeadContent: () => null, Scripts: () => null }
})

vi.mock('#/routes/-devtools', () => ({ default: () => null }))

vi.mock('#/routes/-theme', () => ({
  ThemeProvider: ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children)
}))

describe('root route', () => {
  it('has shell component in options', async () => {
    const { Route } = await import('#/routes/__root')
    const opts = Route.options as unknown as Record<string, unknown>
    expect(opts.shellComponent).toBeInstanceOf(Function)
    expect(opts.notFoundComponent).toBeInstanceOf(Function)
    expect(opts.errorComponent).toBeInstanceOf(Function)
    expect(opts.head).toBeInstanceOf(Function)
    const head = opts.head as () => { meta: Array<unknown>; links: Array<unknown> }
    expect(head().meta).toBeInstanceOf(Array)
    expect(head().links).toBeInstanceOf(Array)
  })

  it('renders shell with route content', async () => {
    // Suppress React warning about <html> inside jsdom's <div>.
    // The shell component renders <html> as the document root (correct for SSR);
    // jsdom always wraps in a <div>, so this warning is expected noise.
    const origError = console.error
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].includes('<html> cannot be a child')) return
      origError.call(console, ...args)
    }

    const { Route } = await import('#/routes/__root')
    const {
      createRootRouteWithContext,
      createRoute,
      createRouter,
      createMemoryHistory,
      RouterProvider
    } = await import('@tanstack/react-router')

    const opts = Route.options as unknown as Record<string, unknown>

    const rootRoute = createRootRouteWithContext<Record<string, unknown>>()({
      shellComponent: opts.shellComponent as unknown as ({
        children
      }: {
        children: React.ReactNode
      }) => React.ReactNode,
      notFoundComponent: opts.notFoundComponent as unknown as () => React.ReactNode,
      errorComponent: opts.errorComponent as unknown as () => React.ReactNode
    })

    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => React.createElement('div', { 'data-testid': 'page-content' }, 'Hello')
    })

    const router = createRouter({
      routeTree: rootRoute.addChildren([indexRoute]),
      history: createMemoryHistory({ initialEntries: ['/'] }),
      context: {}
    })

    render(React.createElement(RouterProvider, { router }))

    await waitFor(
      () => {
        expect(screen.getByTestId('page-content')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    console.error = origError
  })
})
