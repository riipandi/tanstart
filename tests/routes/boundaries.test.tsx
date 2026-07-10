import { screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { GlobalNotFound, GlobalError } from '#/routes/-boundaries'
import { renderWithRouter } from '../test-utils'

describe('GlobalNotFound', () => {
  it('renders 404 message', async () => {
    renderWithRouter([{ path: '/', component: () => React.createElement(GlobalNotFound) }])
    await waitFor(() => {
      expect(screen.getByText('Page not found')).toBeInTheDocument()
      expect(screen.getByText('Error 404')).toBeInTheDocument()
    })
  })

  it('renders back to home link', async () => {
    renderWithRouter([{ path: '/', component: () => React.createElement(GlobalNotFound) }])
    await waitFor(() => {
      const link = screen.getByText('Back to Home')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/')
    })
  })
})

describe('GlobalError', () => {
  const defaultProps = { error: new Error('test error'), reset: () => {} }

  it('renders error message', async () => {
    renderWithRouter([
      { path: '/', component: () => React.createElement(GlobalError, defaultProps) }
    ])
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('Unexpected error')).toBeInTheDocument()
    })
  })

  it('displays error detail when message exists', async () => {
    renderWithRouter([
      { path: '/', component: () => React.createElement(GlobalError, defaultProps) }
    ])
    await waitFor(() => {
      expect(screen.getByText('test error')).toBeInTheDocument()
    })
  })

  it('hides error detail for empty message', async () => {
    renderWithRouter([
      {
        path: '/',
        component: () => React.createElement(GlobalError, { ...defaultProps, error: new Error() })
      }
    ])
    await waitFor(() => {
      expect(screen.queryByText('test error')).not.toBeInTheDocument()
    })
  })

  it('calls reset on try again click', async () => {
    const reset = vi.fn<() => void>()
    renderWithRouter([
      { path: '/', component: () => React.createElement(GlobalError, { ...defaultProps, reset }) }
    ])
    await waitFor(() => {
      screen.getByText('Try again').click()
      expect(reset).toHaveBeenCalledOnce()
    })
  })

  it('renders back to home link', async () => {
    renderWithRouter([
      { path: '/', component: () => React.createElement(GlobalError, defaultProps) }
    ])
    await waitFor(() => {
      const link = screen.getByText('Back to Home')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/')
    })
  })
})
