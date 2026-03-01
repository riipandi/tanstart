import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import type { ParsedLocation } from '@tanstack/react-router'
import { getSession } from '#/lib/auth.server'

interface BeforeLoadParams {
  search?: { redirect?: string }
  location: ParsedLocation
}

export const Route = createFileRoute('/(auth)')({
  component: RouteComponent,
  beforeLoad: async ({ search }: BeforeLoadParams) => {
    const session = await getSession()
    if (session) {
      const redirectTo = search?.redirect ?? '/'
      throw redirect({ href: redirectTo })
    }
  }
})

function RouteComponent() {
  return <Outlet />
}
