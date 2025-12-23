import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app_')({
  component: RouteComponent,
  beforeLoad: async ({ location, context }) => {
    if (!context.auth.isAuthenticated) {
      // Use the current location to power a redirect after login
      // (Do not use `router.state.resolvedLocation` as it can
      // potentially lag behind the actual current location)
      throw redirect({
        href: `/auth/signin?redirect=${location.href}`,
        search: { redirect: location.href },
      })
    }
  },
})

function RouteComponent() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  )
}
