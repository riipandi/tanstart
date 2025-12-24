import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app_/billing')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app_/billing"!</div>
}
