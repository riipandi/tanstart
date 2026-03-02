import { createFileRoute, Link } from '@tanstack/react-router'
import { authClient } from '#/guards/auth-client'
import { ensureSession } from '#/guards/session'
import { ChangePassword } from './-account/change-password'
import { TwoFactorSettings } from './-account/two-factor'
import { UserProfile } from './-account/user-profile'

export const Route = createFileRoute('/(app)/account')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await ensureSession()
    return { ...session }
  }
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { user } = Route.useRouteContext()

  const handleSignOut = async () => {
    const result = await authClient.signOut()
    if (result.error) {
      console.error(result.error)
    }
    return navigate({ to: '/signin', search: { logout: true } })
  }

  return (
    <div className='flex justify-center px-4 py-10'>
      <div className='w-full max-w-xl space-y-8 p-6'>
        <div>
          <h1 className='text-xl font-semibold'>Account Settings</h1>
          <p className='text-on-background-neutral mt-1 text-sm'>Manage your account security</p>
        </div>

        <UserProfile {...user} />
        <TwoFactorSettings {...user} />
        <ChangePassword />

        <div className='flex justify-between pt-4'>
          <Link
            to='/dashboard'
            className='text-foreground-primary text-sm font-medium transition-colors hover:underline'
          >
            Back to Dashboard
          </Link>
          <button
            type='button'
            onClick={handleSignOut}
            className='text-foreground-critical text-sm font-medium transition-colors hover:underline'
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
