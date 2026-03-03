import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSession } from '#/guards/session'
import Header from '#/routes/-header'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) {
      throw redirect({
        to: '/signin',
        search: { redirect: location.href }
      })
    }
    return { session }
  }
})

function RouteComponent() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
