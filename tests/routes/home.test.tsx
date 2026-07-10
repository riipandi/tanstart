import { screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithRouter } from '../test-utils'

describe('index route', () => {
  it('has correct metadata in options', async () => {
    const { Route } = await import('#/routes/(site)/index')
    const opts = Route.options as {
      staticData?: Record<string, unknown>
      head?: () => { meta: Array<Record<string, unknown>> }
    }
    expect(opts.staticData).toEqual({ breadcrumb: 'Home' })
    expect(opts.head).toBeInstanceOf(Function)
    expect(opts.head!().meta).toContainEqual({ title: 'TanStack Start' })
  })

  it('renders page content', async () => {
    const { Route } = await import('#/routes/(site)/index')
    renderWithRouter([{ path: '/', component: Route.options.component! }])
    await waitFor(() => {
      expect(screen.getByText('Start simple, ship quickly.')).toBeInTheDocument()
    })
  })

  it('renders feature cards', async () => {
    const { Route } = await import('#/routes/(site)/index')
    renderWithRouter([{ path: '/', component: Route.options.component! }])
    await waitFor(() => {
      expect(screen.getByText('Type-Safe Routing')).toBeInTheDocument()
      expect(screen.getByText('Server Functions')).toBeInTheDocument()
    })
  })

  it('renders quick start section', async () => {
    const { Route } = await import('#/routes/(site)/index')
    renderWithRouter([{ path: '/', component: Route.options.component! }])
    await waitFor(() => {
      expect(screen.getByText('Quick Start')).toBeInTheDocument()
    })
  })

  it('has external docs link', async () => {
    const { Route } = await import('#/routes/(site)/index')
    renderWithRouter([{ path: '/', component: Route.options.component! }])
    await waitFor(() => {
      const link = screen.getByText('Docs')
      expect(link).toHaveAttribute('href', 'https://tanstack.com/start')
      expect(link).toHaveAttribute('target', '_blank')
    })
  })
})
