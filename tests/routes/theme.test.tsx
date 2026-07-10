import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeProvider, ThemeSwitcher } from '#/routes/-theme'

const { mockUseTheme } = vi.hoisted(() => ({
  mockUseTheme: vi.fn<() => { theme: string | null; setTheme: (t: string) => void }>(() => ({
    theme: 'light',
    setTheme: vi.fn<(...args: Array<unknown>) => void>()
  }))
}))

vi.mock('@lonik/themer', () => ({
  ThemeProvider: ({
    children,
    ...props
  }: { children?: React.ReactNode } & Record<string, unknown>) =>
    React.createElement(
      'div',
      {
        'data-testid': 'theme-provider',
        'data-themes': ((props.themes ?? []) as string[]).join(','),
        'data-default': (props.defaultTheme ?? '') as string
      },
      children
    ),
  useTheme: mockUseTheme
}))

vi.mock('#/utils/variant', () => ({
  clx: (...classes: string[]) => classes.filter(Boolean).join(' ')
}))

beforeEach(() => {
  mockUseTheme.mockReturnValue({
    theme: 'light',
    setTheme: vi.fn<(...args: Array<unknown>) => void>()
  })
})

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement('div', { 'data-testid': 'child' })
      )
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('passes theme config', () => {
    render(React.createElement(ThemeProvider, null, null))
    const el = document.querySelector('[data-testid="theme-provider"]')
    expect(el).toHaveAttribute('data-themes', 'light,dark')
    expect(el).toHaveAttribute('data-default', 'system')
  })
})

describe('ThemeSwitcher', () => {
  it('renders sun icon for light theme', () => {
    render(React.createElement(ThemeSwitcher))
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument()
  })

  it('renders moon icon for dark theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn<(...args: Array<unknown>) => void>()
    })
    render(React.createElement(ThemeSwitcher))
    expect(screen.getByLabelText('Switch to system mode')).toBeInTheDocument()
  })

  it('renders monitor icon for system theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'system',
      setTheme: vi.fn<(...args: Array<unknown>) => void>()
    })
    render(React.createElement(ThemeSwitcher))
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument()
  })

  it('handles null theme as system', () => {
    mockUseTheme.mockReturnValue({
      theme: null,
      setTheme: vi.fn<(...args: Array<unknown>) => void>()
    })
    render(React.createElement(ThemeSwitcher))
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument()
  })

  it('cycles light→dark on click', () => {
    const setTheme = vi.fn<(...args: Array<unknown>) => void>()
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme })
    render(React.createElement(ThemeSwitcher))
    screen.getByRole('button').click()
    expect(setTheme).toHaveBeenCalledWith('dark')
  })

  it('applies className', () => {
    render(React.createElement(ThemeSwitcher, { className: 'foo' }))
    expect(document.querySelector('.foo')).toBeInTheDocument()
  })

  it('falls back to light on unknown theme', () => {
    const setTheme = vi.fn<(...args: Array<unknown>) => void>()
    mockUseTheme.mockReturnValue({ theme: 'unknown', setTheme })
    render(React.createElement(ThemeSwitcher))
    screen.getByRole('button').click()
    expect(setTheme).toHaveBeenCalledWith('light')
  })
})
