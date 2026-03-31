import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ThemeSwitcher } from '#/routes/-theme'

export const Route = createFileRoute('/(site)')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className='p-8'>
      <ThemeSwitcher className='absolute right-4 top-4' />
      <Outlet />
    </div>
  )
}
