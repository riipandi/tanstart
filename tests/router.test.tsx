import React from 'react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  createRouter: vi.fn<(config: Record<string, unknown>) => Record<string, unknown>>(
    (config: Record<string, unknown>) => ({
      ...config,
      options: config,
      __isMock: true
    })
  )
}))

vi.mock('@tanstack/react-router-ssr-query', () => ({
  setupRouterSsrQueryIntegration: vi.fn<() => void>()
}))

vi.mock('#/routes.gen', () => ({
  routeTree: {}
}))

vi.mock('#/provider', () => ({
  getContext: () => ({ queryClient: { __isMock: true } }),
  RootProvider: ({
    children,
    queryClient
  }: {
    children?: React.ReactNode
    queryClient?: Record<string, unknown>
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'root-provider', 'data-client': String(!!queryClient) },
      children
    )
}))

describe('getRouter', () => {
  it('creates a router with expected defaults', async () => {
    const { getRouter } = await import('#/router')
    const router = getRouter()
    expect(router).toHaveProperty('options')
    expect(router.options).toMatchObject({
      scrollRestoration: true,
      defaultPreload: 'intent'
    })
  })

  it('provides a Wrap component that renders RootProvider', async () => {
    const { render } = await import('@testing-library/react')
    const { getRouter } = await import('#/router')
    const router = getRouter()
    const Wrap = router.options.Wrap as React.ComponentType<{ children: React.ReactNode }>
    const { container } = render(React.createElement(Wrap, null, React.createElement('span')))
    expect(container.querySelector('[data-testid="root-provider"]')).toBeTruthy()
  })
})
