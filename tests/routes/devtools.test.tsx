import { render } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import DevTools from '#/routes/-devtools'

vi.mock('@tanstack/react-devtools', () => ({
  TanStackDevtools: ({
    plugins,
    config
  }: {
    plugins?: Array<unknown>
    config?: { position?: string }
  }) =>
    React.createElement('div', {
      'data-testid': 'devtools',
      'data-plugins': String(plugins?.length ?? 0),
      'data-position': config?.position
    })
}))

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtoolsPanel: () => React.createElement('div', { 'data-testid': 'query-panel' })
}))

vi.mock('@tanstack/react-router-devtools', () => ({
  TanStackRouterDevtoolsPanel: () => React.createElement('div', { 'data-testid': 'router-panel' })
}))

describe('DevTools', () => {
  it('renders with defaults', () => {
    render(React.createElement(DevTools))
    expect(document.querySelector('[data-testid="devtools"]')).toBeInTheDocument()
  })

  it('passes plugins and config', () => {
    render(React.createElement(DevTools))
    const el = document.querySelector('[data-testid="devtools"]')
    expect(el).toHaveAttribute('data-plugins', '2')
    expect(el).toHaveAttribute('data-position', 'bottom-left')
  })

  it('accepts queryClient prop', () => {
    render(React.createElement(DevTools, { queryClient: undefined }))
    expect(document.querySelector('[data-testid="devtools"]')).toBeInTheDocument()
  })
})
