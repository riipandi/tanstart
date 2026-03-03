import { createFileRoute, Outlet } from '@tanstack/react-router'
import Header from '#/routes/-header'

export const Route = createFileRoute('/(home)')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
