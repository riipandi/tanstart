import { useTheme } from '@lonik/themer'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { GlobalNotFound } from '#/components/boundaries'
import { ThemeSelector } from '#/components/theme-selector'
import { getSession } from '#/guards/session'

interface BeforeLoadParams {
  search?: { redirect?: string }
}

export const Route = createFileRoute('/(auth)')({
  component: RouteComponent,
  notFoundComponent: GlobalNotFound,
  beforeLoad: async ({ search }: BeforeLoadParams) => {
    const session = await getSession()
    if (session) {
      const redirectTo = search?.redirect ?? '/dashboard'
      throw redirect({ href: redirectTo })
    }
  }
})

function RouteComponent() {
  const { themes, theme, setTheme } = useTheme()

  return (
    <div className='bg-background-neutral-faded/5 flex min-h-screen items-center justify-center'>
      <div className='absolute top-4 right-4'>
        <ThemeSelector
          value={theme}
          themes={themes}
          onChange={setTheme}
          triggerVariant='ghost'
          className='ml-auto'
        />
      </div>
      <Outlet />
    </div>
  )
}
