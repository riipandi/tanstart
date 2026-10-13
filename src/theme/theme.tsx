import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { darkThemeClass } from '#/styles/core/themes'

export type ThemeSetting = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'tanstart-theme'
const THEME_EVENT = 'tanstart:theme-change'

const cycle: Record<ThemeSetting, ThemeSetting> = { light: 'dark', dark: 'system', system: 'light' }

const labels: Record<ThemeSetting, string> = {
  light: 'Switch to dark mode',
  dark: 'Switch to system mode',
  system: 'Switch to light mode'
}

function isDarkFor(setting: ThemeSetting) {
  return (
    setting === 'dark' ||
    (setting === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )
}

function applyTheme(setting: ThemeSetting) {
  const isDark = isDarkFor(setting)

  // Theme classes go on `documentElement` (not a wrapper): dialogs and
  // popovers portal out and would escape a subtree theme. The compiled
  // theme className may contain multiple class tokens (one per var group).
  for (const token of darkThemeClass.split(/\s+/).filter(Boolean)) {
    document.documentElement.classList.toggle(token, isDark)
  }
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
}

function getSnapshot(): ThemeSetting {
  return (localStorage.getItem(STORAGE_KEY) as ThemeSetting | null) ?? 'system'
}

function getServerSnapshot(): ThemeSetting {
  return 'system'
}

function subscribe(callback: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')

  const onStorageChange = () => callback()
  const onSystemChange = () => {
    // The setting value may stay 'system' while the resolved theme flips.
    applyTheme(getSnapshot())
    callback()
  }

  window.addEventListener(THEME_EVENT, onStorageChange)
  media.addEventListener('change', onSystemChange)
  return () => {
    window.removeEventListener(THEME_EVENT, onStorageChange)
    media.removeEventListener('change', onSystemChange)
  }
}

export function ThemeProvider(props: React.PropsWithChildren) {
  const setting = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Synchronize the external store (localStorage + system preference) with
  // the document element's theme classes.
  useEffect(() => {
    applyTheme(setting)
  }, [setting])

  return <>{props.children}</>
}

export function useThemeSetting() {
  const setting = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setTheme = useCallback((next: ThemeSetting) => {
    localStorage.setItem(STORAGE_KEY, next)
    window.dispatchEvent(new Event(THEME_EVENT))
  }, [])

  return { setting, setTheme }
}

export { cycle, labels, applyTheme }
