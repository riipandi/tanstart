import { createFileRoute } from '@tanstack/react-router'
import { Copy } from '#/components/copy'
import { ensureSession } from '#/guards/session'
import { ChangePassword } from './-account/change-password'
import { TwoFactorSettings } from './-account/two-factor'

export const Route = createFileRoute('/(app)/account/security')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await ensureSession()
    return { ...session }
  }
})

function RouteComponent() {
  const { user } = Route.useRouteContext()

  return (
    <div className='flex justify-center px-4 py-10'>
      <div className='w-full max-w-2xl space-y-8'>
        <div>
          <h1 className='text-xl font-semibold'>Account Security</h1>
          <p className='text-on-background-neutral mt-1 space-x-1 text-sm'>
            <span>User ID:</span>
            <Copy content={user.id}>{user.id}</Copy>
          </p>
        </div>

        <TwoFactorSettings {...user} />
        <ChangePassword />
      </div>
    </div>
  )
}
