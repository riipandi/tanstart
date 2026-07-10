import { screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithRouter } from '../test-utils'

describe('about route', () => {
  it('has correct metadata in options', async () => {
    const { Route } = await import('#/routes/(site)/about')
    const opts = Route.options as {
      staticData?: Record<string, unknown>
      head?: () => { meta: Array<Record<string, unknown>> }
    }
    expect(opts.staticData).toEqual({ breadcrumb: 'About' })
    expect(opts.head).toBeInstanceOf(Function)
    expect(opts.head!().meta).toContainEqual({ title: 'About - TanStack Start' })
  })

  it('renders page content', async () => {
    const { Route } = await import('#/routes/(site)/about')
    renderWithRouter([{ path: '/', component: Route.options.component! }])
    await waitFor(() => {
      expect(screen.getByText('A small starter with room to grow.')).toBeInTheDocument()
    })
  })

  it('has back link to home', async () => {
    const { Route } = await import('#/routes/(site)/about')
    renderWithRouter([{ path: '/', component: Route.options.component! }])
    await waitFor(() => {
      const link = screen.getByText(/back/i)
      expect(link).toHaveAttribute('href', '/')
    })
  })
})
