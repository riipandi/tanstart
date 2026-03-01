import { createFileRoute, Outlet } from '@tanstack/react-router'
import { authMiddleware } from '#/middlewares/auth.middleware'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  return <Outlet />
}
