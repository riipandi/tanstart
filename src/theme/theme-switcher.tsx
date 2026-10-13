import * as stylex from '@stylexjs/stylex'
import * as Lucide from 'lucide-react'
import { Activity } from 'react'
import { pageStyles } from '#/styles/pages/site.stylex'
import { cycle, labels, useThemeSetting, type ThemeSetting } from './theme'
import { themeSwitcherStyles } from './theme-switcher.stylex'

export function ThemeSwitcher() {
  const { setting, setTheme } = useThemeSetting()
  const current: ThemeSetting = setting

  return (
    <div {...stylex.props(pageStyles.switcherPosition, themeSwitcherStyles.wrapper)}>
      <button
        type='button'
        onClick={() => setTheme(cycle[current] ?? 'light')}
        {...stylex.props(themeSwitcherStyles.button)}
        aria-label={labels[current]}
        suppressHydrationWarning
      >
        <Activity mode={current === 'light' ? 'visible' : 'hidden'}>
          <Lucide.Sun {...stylex.props(themeSwitcherStyles.icon)} />
        </Activity>
        <Activity mode={current === 'dark' ? 'visible' : 'hidden'}>
          <Lucide.Moon {...stylex.props(themeSwitcherStyles.icon)} />
        </Activity>
        <Activity mode={current === 'system' ? 'visible' : 'hidden'}>
          <Lucide.Monitor {...stylex.props(themeSwitcherStyles.icon)} />
        </Activity>
      </button>
    </div>
  )
}
