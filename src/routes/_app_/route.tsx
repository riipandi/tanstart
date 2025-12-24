import { createFileRoute, Outlet } from '@tanstack/react-router'
import { authMiddleware } from '#/middlewares/auth.middleware'

export const Route = createFileRoute('/_app_')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  )
}
