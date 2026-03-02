import { Link, useNavigate } from '@tanstack/react-router'
import { authClient } from '#/guards/auth-client'

export default function UserMenu() {
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    const result = await authClient.signOut()

    if (result.error) {
      console.error(result.error)
    }

    return navigate({ to: '/signin', search: { logout: true } })
  }

  if (isPending) {
    return <div className='bg-background-neutral h-10 w-10 animate-pulse rounded-lg' />
  }

  if (session?.user) {
    return (
      <div className='flex items-center gap-3'>
        {session.user.image ? (
          <img src={session.user.image} alt='' className='h-10 w-10 rounded-lg' />
        ) : (
          <div className='bg-background-neutral flex h-10 w-10 items-center justify-center rounded-lg'>
            <span className='text-foreground-neutral text-sm font-medium'>
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <button
          className='border-border-neutral bg-background-elevation-base text-foreground-neutral hover:bg-background-neutral-faded flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors'
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <Link
      to='/signin'
      className='border-border-neutral bg-background-elevation-base text-foreground-neutral hover:bg-background-neutral-faded inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors'
    >
      Sign in
    </Link>
  )
}
