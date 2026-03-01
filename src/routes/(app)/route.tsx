import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSession } from '#/lib/auth.server'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) {
      throw redirect({
        to: '/signin',
        search: { redirect: location.pathname }
      })
    }
    return { user: session.user }
  }
})

function RouteComponent() {
  return <Outlet />
}
