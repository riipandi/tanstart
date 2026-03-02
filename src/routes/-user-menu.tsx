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
    return <div className='bg-background-neutral h-8 w-8 animate-pulse' />
  }

  if (session?.user) {
    return (
      <div className='flex items-center gap-2'>
        {session.user.image ? (
          <img src={session.user.image} alt='' className='h-8 w-8' />
        ) : (
          <div className='bg-background-neutral flex h-8 w-8 items-center justify-center'>
            <span className='text-foreground-neutral text-xs font-medium'>
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <button
          className='border-border-neutral bg-background-elevation-base text-foreground-neutral hover:bg-background-neutral-faded h-9 flex-1 border px-4 text-sm font-medium transition-colors'
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
      className='border-border-neutral bg-background-elevation-base text-foreground-neutral hover:bg-background-neutral-faded inline-flex h-9 items-center border px-4 text-sm font-medium transition-colors'
    >
      Sign in
    </Link>
  )
}
