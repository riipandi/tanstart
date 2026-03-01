import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '#/libraries/fuma.layout'

export const Route = createFileRoute('/(home)/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 font-medium text-xl">Fumadocs on TanStack Start.</h1>
      <Link
        to="/docs/$"
        params={{ _splat: '' }}
        className="mx-auto rounded-lg bg-fd-primary px-3 py-2 font-medium text-fd-primary-foreground text-sm"
      >
        Open Docs
      </Link>
    </div>
    </HomeLayout>
  )
}
