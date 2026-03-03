import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { z } from 'zod'
import { Alert, AlertDescription } from '#/components/alert'
import { Copy } from '#/components/copy'
import { ensureSession } from '#/guards/session'
import { ChangePassword } from './-account/change-password'
import { DeleteAccount } from './-account/delete-account'
import { SessionsList } from './-account/sessions-list'
import { SocialAccounts } from './-account/social-accounts'
import { TwoFactorSettings } from './-account/two-factor'
import { UserProfile } from './-account/user-profile'

export const Route = createFileRoute('/(app)/account')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await ensureSession()
    return { ...session }
  },
  validateSearch: z.object({
    deleteCancelled: z.union([z.string(), z.boolean()]).optional()
  })
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const search = Route.useSearch()

  // Check if user cancelled the deletion
  const deleteCancelled = search.deleteCancelled === true || search.deleteCancelled === 'true'

  return (
    <div className='flex justify-center px-4 py-10'>
      <div className='w-full max-w-2xl space-y-8 p-6'>
        {deleteCancelled && (
          <Alert variant='success'>
            <Lucide.Check className='size-4' />
            <AlertDescription>
              <strong>Account deletion cancelled.</strong> Your account remains active and no data
              has been deleted.
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h1 className='text-xl font-semibold'>Account Settings</h1>
          <p className='text-on-background-neutral mt-1 space-x-1 text-sm'>
            <span>User ID:</span>
            <Copy content={user.id}>{user.id}</Copy>
          </p>
        </div>

        <UserProfile {...user} />
        <SocialAccounts />
        <TwoFactorSettings {...user} />
        <ChangePassword />
        <SessionsList />
        <DeleteAccount />
      </div>
    </div>
  )
}
