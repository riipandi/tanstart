import { Link, useNavigate, type LinkProps } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { authClient } from '#/guards/auth-client'
import { clx } from '#/utils/variant'

interface NavItem {
  to: LinkProps['to']
  label: string
  icon: React.ComponentType<React.SVGAttributes<SVGElement>>
  groupId?: string
  children?: NavItem[]
}

const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: Lucide.Home },
  {
    to: '/demo/start/server-funcs',
    label: 'Start - Server Functions',
    icon: Lucide.SquareFunction
  },
  {
    to: '/demo/start/ssr',
    label: 'Start - SSR Demos',
    icon: Lucide.StickyNote,
    groupId: 'StartSSRDemo',
    children: [
      { to: '/demo/start/ssr/spa-mode', label: 'SPA Mode', icon: Lucide.StickyNote },
      { to: '/demo/start/ssr/full-ssr', label: 'Full SSR', icon: Lucide.StickyNote },
      { to: '/demo/start/ssr/data-only', label: 'Data Only', icon: Lucide.StickyNote }
    ]
  },
  { to: '/demo/table', label: 'TanStack Table', icon: Lucide.Table },
  { to: '/demo/tanstack-query', label: 'TanStack Query', icon: Lucide.Network },
  { to: '/demo/trpc-todo', label: 'tRPC Todo', icon: Lucide.Network }
]

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
        {session.user.image ? (
          <img src={session.user.image} alt='' className='size-8 rounded-lg' />
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

interface NavigationItemProps {
  item: NavItem
  onClose: () => void
  isChild?: boolean
}

function NavigationItem({ item, onClose, isChild }: NavigationItemProps) {
  return (
    <Link
      to={item.to}
      onClick={onClose}
      className={clx(
        'hover:bg-sidebar-accent mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
        isChild && 'ml-4'
      )}
      activeProps={{
        className: clx(
          'bg-sidebar-primary text-sidebar-primary-foreground mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
          isChild && 'ml-4'
        )
      }}
    >
      <item.icon className='size-4' />
      <span className='text-sm font-medium'>{item.label}</span>
    </Link>
  )
}

interface NavigationGroupProps {
  item: NavItem
  onClose: () => void
  isExpanded: boolean
  onToggle: () => void
}

function NavigationGroup({ item, onClose, isExpanded, onToggle }: NavigationGroupProps) {
  return (
    <>
      <div className='flex flex-row justify-between'>
        <Link
          to={item.to}
          onClick={onClose}
          className='hover:bg-sidebar-accent mb-2 flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 transition-colors'
          activeProps={{
            className:
              'flex-1 flex items-center gap-3 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground px-3 py-2.5 transition-colors mb-2'
          }}
        >
          <item.icon className='size-4' />
          <span className='text-sm font-medium'>{item.label}</span>
        </Link>
        <button
          className='hover:bg-sidebar-accent rounded-lg p-2 transition-colors'
          onClick={onToggle}
        >
          {isExpanded ? (
            <Lucide.ChevronDown className='size-4' />
          ) : (
            <Lucide.ChevronRight className='size-4' />
          )}
        </button>
      </div>
      {isExpanded && item.children && (
        <div className='ml-4 flex flex-col'>
          {item.children.map((child) => (
            <NavigationItem key={child.to} item={child} onClose={onClose} isChild />
          ))}
        </div>
      )}
    </>
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
          <Lucide.Menu className='size-8' />
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
        className={clx(
          'bg-sidebar text-sidebar-foreground shadow-overlay fixed top-0 left-0 z-50 flex h-full w-80',
          'transform flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='border-sidebar-border flex items-center justify-between border-b p-4'>
          <h2 className='text-base font-semibold'>Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className='hover:bg-sidebar-accent rounded-lg p-2 transition-colors'
            aria-label='Close menu'
          >
            <Lucide.X className='size-xx' />
          </button>
        </div>

        <nav className='flex-1 overflow-y-auto p-4'>
          {navItems.map((item) => {
            if (item.children && item.groupId) {
              return (
                <NavigationGroup
                  key={item.to}
                  item={item}
                  onClose={() => setIsOpen(false)}
                  isExpanded={groupedExpanded[item.groupId] || false}
                  onToggle={() =>
                    setGroupedExpanded((prev) => ({
                      ...prev,
                      [item.groupId!]: !prev[item.groupId!]
                    }))
                  }
                />
              )
            }

            return <NavigationItem key={item.to} item={item} onClose={() => setIsOpen(false)} />
          })}
        </nav>

        <div className='border-sidebar-border bg-sidebar flex flex-col gap-2 border-t p-4'>
          <UserMenu />
        </div>
      </aside>
    </>
  )
}
