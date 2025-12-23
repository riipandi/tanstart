import { AuthView } from '@daveyplate/better-auth-ui'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/$path')({
  component: RouteComponent,
})

function RouteComponent() {
  const { path } = Route.useParams()

  return (
    <main className="container mx-auto my-auto flex flex-col items-center p-4 md:p-6">
      <AuthView path={path} />
    </main>
  )
}
