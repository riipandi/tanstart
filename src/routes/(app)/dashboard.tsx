import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '#/guards/auth-client'
import { ensureSession } from '#/guards/session'

export const Route = createFileRoute('/(app)/dashboard')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await ensureSession()
    return { ...session }
  }
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const navigate = Route.useNavigate()

  const handleSignOut = async () => {
    const result = await authClient.signOut()

    if (result.error) {
      console.error(result.error)
    }

    return navigate({ to: '/signin', search: { logout: true } })
  }

  return (
    <div className='flex justify-center px-6 py-10'>
      <div className='w-full max-w-md space-y-6 p-6'>
        <div className='space-y-1.5'>
          <h1 className='text-foreground-primary text-xl font-semibold'>Welcome back</h1>
          <p className='text-on-background-neutral text-sm'>You're signed in as {user.email}</p>
        </div>

        <div className='flex items-center gap-3'>
          {user.imageURL ? (
            <img src={user.imageURL} alt={user.name} className='h-10 w-10 rounded-lg' />
          ) : (
            <div className='bg-background-neutral flex h-10 w-10 items-center justify-center rounded-lg'>
              <span className='text-foreground-neutral text-sm font-medium'>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium'>{user.name}</p>
            <p className='text-on-background-neutral truncate text-xs'>{user.email}</p>
          </div>
        </div>

        <button
          type='button'
          className='border-border-neutral bg-background-elevation-base text-foreground-neutral hover:bg-background-neutral-faded w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors'
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
