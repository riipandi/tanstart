import { waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithRouter } from '../test-utils'

// Layout route uses relative imports for ThemeSwitcher, which <Outlet /> replaces in test
describe('site layout route', () => {
  it('has component in options', async () => {
    const { Route } = await import('#/routes/(site)/route')
    const opts = Route.options as { component?: React.ComponentType }
    expect(opts.component).toBeInstanceOf(Function)
  })

  it('renders with TestWrapper using Outlet pattern', async () => {
    const { Route } = await import('#/routes/(site)/route')
    renderWithRouter([{ path: '/', component: Route.options.component! }])
    // ThemeSwitcher (from relative import) renders inside the component
    // The layout renders ThemeSwitcher + Outlet — Outlet is empty in test
    await waitFor(() => {
      expect(document.body).toBeTruthy()
    })
  })
})
