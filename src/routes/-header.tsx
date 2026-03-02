import { Link, useNavigate } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { authClient } from '#/guards/auth-client'

function UserMenu() {
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
        {session.user.imageURL ? (
          <img src={session.user.imageURL} alt='' className='size-8 rounded-lg' />
        ) : (
          <div className='bg-background-neutral flex size-8 items-center justify-center rounded-lg'>
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

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [groupedExpanded, setGroupedExpanded] = useState<Record<string, boolean>>({})

  return (
    <>
      <header className='bg-sidebar text-sidebar-foreground shadow-raised flex items-center p-4'>
        <button
          onClick={() => setIsOpen(true)}
          className='hover:bg-sidebar-accent rounded-lg p-2 transition-colors'
          aria-label='Open menu'
        >
          <Lucide.Menu size={20} />
        </button>
        <h1 className='ml-4 text-lg font-semibold'>
          <Link to='/'>
            <img
              src='/images/tanstack-word-logo-white.svg'
              className='h-9 invert-75 dark:invert-0'
              alt='TanStack Logo'
            />
          </Link>
        </h1>
      </header>

      <aside
        className={`bg-sidebar text-sidebar-foreground shadow-overlay fixed top-0 left-0 z-50 flex h-full w-80 transform flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='border-sidebar-border flex items-center justify-between border-b p-4'>
          <h2 className='text-base font-semibold'>Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className='hover:bg-sidebar-accent rounded-lg p-2 transition-colors'
            aria-label='Close menu'
          >
            <Lucide.X size={20} />
          </button>
        </div>

        <nav className='flex-1 overflow-y-auto p-4'>
          <Link
            to='/'
            onClick={() => setIsOpen(false)}
            className='hover:bg-sidebar-accent mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors'
            activeProps={{
              className:
                'flex items-center gap-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground px-3 py-2.5 transition-colors mb-2'
            }}
          >
            <Lucide.Home size={18} />
            <span className='text-sm font-medium'>Home</span>
          </Link>

          {/* Demo Links Start */}

          <Link
            to='/demo/start/server-funcs'
            onClick={() => setIsOpen(false)}
            className='hover:bg-sidebar-accent mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors'
            activeProps={{
              className:
                'flex items-center gap-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground px-3 py-2.5 transition-colors mb-2'
            }}
          >
            <Lucide.SquareFunction size={18} />
            <span className='text-sm font-medium'>Start - Server Functions</span>
          </Link>

          <div className='flex flex-row justify-between'>
            <Link
              to='/demo/start/ssr'
              onClick={() => setIsOpen(false)}
              className='hover:bg-sidebar-accent mb-2 flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 transition-colors'
              activeProps={{
                className:
                  'flex-1 flex items-center gap-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground px-3 py-2.5 transition-colors mb-2'
              }}
            >
              <Lucide.StickyNote size={18} />
              <span className='text-sm font-medium'>Start - SSR Demos</span>
            </Link>
            <button
              className='hover:bg-sidebar-accent rounded-lg p-2 transition-colors'
              onClick={() =>
                setGroupedExpanded((prev) => ({
                  ...prev,
                  StartSSRDemo: !prev.StartSSRDemo
                }))
              }
            >
              {groupedExpanded.StartSSRDemo ? (
                <Lucide.ChevronDown size={18} />
              ) : (
                <Lucide.ChevronRight size={18} />
              )}
            </button>
          </div>
          {groupedExpanded.StartSSRDemo && (
            <div className='ml-4 flex flex-col'>
              <Link
                to='/demo/start/ssr/spa-mode'
                onClick={() => setIsOpen(false)}
                className='hover:bg-sidebar-accent mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors'
                activeProps={{
                  className:
                    'flex items-center gap-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground px-3 py-2.5 transition-colors mb-2'
                }}
              >
                <Lucide.StickyNote size={18} />
                <span className='text-sm font-medium'>SPA Mode</span>
              </Link>

              <Link
                to='/demo/start/ssr/full-ssr'
                onClick={() => setIsOpen(false)}
                className='hover:bg-sidebar-accent mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors'
                activeProps={{
                  className:
                    'flex items-center gap-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground px-3 py-2.5 transition-colors mb-2'
                }}
              >
                <Lucide.StickyNote size={18} />
                <span className='text-sm font-medium'>Full SSR</span>
              </Link>

              <Link
                to='/demo/start/ssr/data-only'
                onClick={() => setIsOpen(false)}
                className='hover:bg-sidebar-accent mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors'
                activeProps={{
                  className:
                    'flex items-center gap-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground px-3 py-2.5 transition-colors mb-2'
                }}
              >
                <Lucide.StickyNote size={18} />
                <span className='text-sm font-medium'>Data Only</span>
              </Link>
            </div>
          )}

          <Link
            to='/demo/table'
            onClick={() => setIsOpen(false)}
            className='hover:bg-sidebar-accent mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors'
            activeProps={{
              className:
                'flex items-center gap-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground px-3 py-2.5 transition-colors mb-2'
            }}
          >
            <Lucide.Table size={18} />
            <span className='text-sm font-medium'>TanStack Table</span>
          </Link>

          <Link
            to='/demo/tanstack-query'
            onClick={() => setIsOpen(false)}
            className='hover:bg-sidebar-accent mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors'
            activeProps={{
              className:
                'flex items-center gap-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground px-3 py-2.5 transition-colors mb-2'
            }}
          >
            <Lucide.Network size={18} />
            <span className='text-sm font-medium'>TanStack Query</span>
          </Link>

          <Link
            to='/demo/trpc-todo'
            onClick={() => setIsOpen(false)}
            className='hover:bg-sidebar-accent mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors'
            activeProps={{
              className:
                'flex items-center gap-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground px-3 py-2.5 transition-colors mb-2'
            }}
          >
            <Lucide.Network size={18} />
            <span className='text-sm font-medium'>tRPC Todo</span>
          </Link>

          {/* Demo Links End */}
        </nav>

        <div className='border-sidebar-border bg-sidebar flex flex-col gap-2 border-t p-4'>
          <UserMenu />
        </div>
      </aside>
    </>
  )
}
