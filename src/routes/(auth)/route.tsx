import { useTheme } from '@lonik/themer'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { GlobalNotFound } from '#/components/boundaries'
import { ThemeSelector } from '#/components/theme-selector'
import { getSession } from '#/guards/session'

export const Route = createFileRoute('/(auth)')({
  component: RouteComponent,
  notFoundComponent: GlobalNotFound,
  beforeLoad: async ({ search }) => {
    const session = await getSession()

    // // TODO: Two-Factor page require authenticated
    // if (location.pathname === '/two-factor') {
    //   if (!hasTwoFactorCookie) {
    //     throw redirect({ to: '/signin', search: { redirect: search?.redirect } })
    //   }
    // }

    if (session) {
      throw redirect({ to: search?.redirect ?? '/dashboard' })
    }
  },
  validateSearch: z.object({
    redirect: z.string().optional()
  })
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
