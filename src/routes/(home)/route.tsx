import { createFileRoute, Outlet } from '@tanstack/react-router'
import Navbar from '#/routes/-navbar'

export const Route = createFileRoute('/(home)')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}
