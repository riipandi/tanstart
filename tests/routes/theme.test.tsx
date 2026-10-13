import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeProvider, useThemeSetting as useThemeSettingActual } from '#/theme/theme'
import type { ThemeSetting } from '#/theme/theme'
import { ThemeSwitcher } from '#/theme/theme-switcher'

const { mockSetTheme, mockSettingRef } = vi.hoisted(() => ({
  mockSetTheme: vi.fn<(next: ThemeSetting) => void>(),
  mockSettingRef: { current: 'light' as ThemeSetting }
}))

const Probe = () => {
  const { setting } = useThemeSettingActual()
  return <div data-testid='probe'>{setting}</div>
}

vi.mock('#/routes/-theme', async (importOriginal) => {
  const actual = await importOriginal<typeof import('#/theme/theme')>()
  return {
    ...actual,
    useThemeSetting: vi.fn<() => { setting: ThemeSetting; setTheme: (next: ThemeSetting) => void }>(
      () => ({
        setting: mockSettingRef.current,
        setTheme: mockSetTheme
      })
    )
  }
})
beforeEach(() => {
  mockSettingRef.current = 'light'
  mockSetTheme.mockClear()
  localStorage.clear()
  document.documentElement.className = ''
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
    document.documentElement.className = ''
  })

  it('applies saved theme from localStorage', () => {
    localStorage.setItem('tanstart-theme', 'dark')
    render(React.createElement(ThemeProvider, null, null))
    expect(document.documentElement.style.colorScheme).toBe('dark')
    document.documentElement.className = ''
  })
})

describe('ThemeSwitcher', () => {
  it('renders sun icon for light theme', () => {
    mockSettingRef.current = 'light'
    render(React.createElement(ThemeSwitcher))
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument()
  })

  it('renders moon icon for dark theme', () => {
    mockSettingRef.current = 'dark'
    render(React.createElement(ThemeSwitcher))
    expect(screen.getByLabelText('Switch to system mode')).toBeInTheDocument()
  })

  it('renders monitor icon for system theme', () => {
    mockSettingRef.current = 'system'
    render(React.createElement(ThemeSwitcher))
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument()
  })

  it('cycles light→dark on click', () => {
    mockSettingRef.current = 'light'
    render(React.createElement(ThemeSwitcher))
    screen.getByRole('button').click()
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('falls back to light on unknown theme', () => {
    mockSettingRef.current = 'unknown' as ThemeSetting
    render(React.createElement(ThemeSwitcher))
    screen.getByRole('button').click()
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})

describe('useThemeSetting', () => {
  it('returns mocked context value', () => {
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('light')
  })
})
