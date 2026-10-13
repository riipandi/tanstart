import * as stylex from '@stylexjs/stylex'
import * as Lucide from 'lucide-react'
import { colors, radius } from '#/styles/core/colors.stylex'
import { pageStyles } from '#/styles/pages/site.stylex'
import { cycle, labels, useThemeSetting, type ThemeSetting } from './theme'

const themeSwitcherStyles = stylex.create({
  wrapper: {
    display: 'flex'
  },
  button: {
    borderRadius: radius.sm,
    padding: 8,
    transitionProperty: 'background-color, color',
    transitionDuration: '150ms',
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.backgroundNeutralFaded
    },
    color: {
      default: colors.foregroundNeutralFaded,
      ':hover': colors.foregroundNeutral
    }
  },
  icon: {
    width: 16,
    height: 16
  }
})

// Icon visibility is CSS-driven via `data-theme-setting` on <html> (set
// before first paint), so the correct icon appears without a hydration
// flash. React state only provides aria-label and the click handler.
const icons: { setting: ThemeSetting; Icon: typeof Lucide.Sun }[] = [
  { setting: 'light', Icon: Lucide.Sun },
  { setting: 'dark', Icon: Lucide.Moon },
  { setting: 'system', Icon: Lucide.Monitor }
]

export function ThemeSwitcher() {
  const { setting, setTheme } = useThemeSetting()

  return (
    <div {...stylex.props(pageStyles.switcherPosition, themeSwitcherStyles.wrapper)}>
      <button
        type='button'
        onClick={() => setTheme(cycle[setting] ?? 'light')}
        {...stylex.props(themeSwitcherStyles.button)}
        aria-label={labels[setting]}
        suppressHydrationWarning
      >
        {icons.map(({ setting: key, Icon }) => (
          <span key={key} data-theme-icon={key}>
            <Icon {...stylex.props(themeSwitcherStyles.icon)} />
          </span>
        ))}
      </button>
    </div>
  )
}
