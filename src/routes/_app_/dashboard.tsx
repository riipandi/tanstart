import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app_/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app_/dashboard"!</div>
}
