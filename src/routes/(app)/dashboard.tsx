import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/(app)/dashboard')({
  component: RouteComponent
})

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className='flex items-center justify-center py-10'>
        <div className='h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-800 dark:border-t-neutral-100' />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className='flex justify-center px-4 py-10'>
      <div className='w-full max-w-md space-y-6 p-6'>
        <div className='space-y-1.5'>
          <h1 className='text-lg leading-none font-semibold tracking-tight'>Welcome back</h1>
          <p className='text-sm text-neutral-500 dark:text-neutral-400'>
            You're signed in as {session.user.email}
          </p>
        </div>

        <div className='flex items-center gap-3'>
          {session.user.image ? (
            <img src={session.user.image} alt='' className='h-10 w-10' />
          ) : (
            <div className='flex h-10 w-10 items-center justify-center bg-neutral-200 dark:bg-neutral-800'>
              <span className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
                {session.user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium'>{session.user.name}</p>
            <p className='truncate text-xs text-neutral-500 dark:text-neutral-400'>
              {session.user.email}
            </p>
          </div>
        </div>

        <button
          onClick={() => authClient.signOut()}
          className='h-9 w-full border border-neutral-300 px-4 text-sm font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
        >
          Sign out
        </button>

        <p className='text-center text-xs text-neutral-400 dark:text-neutral-500'>
          Built with{' '}
          <a
            href='https://better-auth.com'
            target='_blank'
            rel='noopener noreferrer'
            className='font-medium hover:text-neutral-600 dark:hover:text-neutral-300'
          >
            BETTER-AUTH
          </a>
          .
        </p>
      </div>
    </div>
  )
}
