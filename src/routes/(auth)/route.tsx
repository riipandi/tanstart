import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { GlobalNotFound } from '#/components/boundaries'
import { getSession } from '#/guards/session'

interface BeforeLoadParams {
  search?: { redirect?: string }
}

export const Route = createFileRoute('/(auth)')({
  component: RouteComponent,
  notFoundComponent: GlobalNotFound,
  beforeLoad: async ({ search }: BeforeLoadParams) => {
    const session = await getSession()
    if (session) {
      const redirectTo = search?.redirect ?? '/dashboard'
      throw redirect({ href: redirectTo })
    }
  }
})

function RouteComponent() {
  return <Outlet />
}
