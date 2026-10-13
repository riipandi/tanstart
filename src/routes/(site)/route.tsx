import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { pageStyles } from '#/styles/pages/site.stylex'
import { ThemeSwitcher } from '#/theme/theme-switcher'

export const Route = createFileRoute('/(site)')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div {...stylex.props(pageStyles.page)}>
      <ThemeSwitcher />
      <Outlet />
    </div>
  )
}
