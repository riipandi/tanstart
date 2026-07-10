import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { getContext, RootProvider } from './provider'

describe('getContext', () => {
  it('returns a queryClient', () => {
    const ctx = getContext()
    expect(ctx).toHaveProperty('queryClient')
  })
})

describe('RootProvider', () => {
  beforeEach(() => {
    render(
      <RootProvider queryClient={getContext().queryClient}>
        <div data-testid='child' />
      </RootProvider>
    )
  })

  it('renders children', () => {
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
