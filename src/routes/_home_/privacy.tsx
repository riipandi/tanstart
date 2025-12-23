import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_home_/privacy')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_home_/privacy"!</div>
}
