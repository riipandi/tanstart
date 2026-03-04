import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Activity } from 'react'
import { z } from 'zod'
import { Alert, AlertDescription } from '#/components/alert'
import { Copy } from '#/components/copy'
import { ensureSession } from '#/guards/session'
import { ChangeEmail } from './-account/change-email'
import { DeleteAccount } from './-account/delete-account'
import { SessionsList } from './-account/sessions-list'
import { SocialAccounts } from './-account/social-accounts'
import { UserProfile } from './-account/user-profile'

export const Route = createFileRoute('/(app)/account/')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await ensureSession()
    return { ...session }
  },
  validateSearch: z.object({
    delete_cancelled: z.union([z.string(), z.boolean()]).optional(),
    email_changed: z.union([z.string(), z.boolean()]).optional(),
    error: z.string().optional()
  })
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const search = Route.useSearch()

  return (
    <div className='flex justify-center px-4 py-10'>
      <div className='w-full max-w-2xl space-y-8'>
        <Activity mode={!search.error && search.delete_cancelled ? 'visible' : 'hidden'}>
          <Alert variant='success'>
            <Lucide.Check className='size-4' />
            <AlertDescription>
              <strong>Account deletion cancelled.</strong> Your account remains active and no data
              has been deleted.
            </AlertDescription>
          </Alert>
        </Activity>

        <Activity mode={!search.error && search.email_changed ? 'visible' : 'hidden'}>
          <Alert variant='success'>
            <Lucide.Check className='size-4' />
            <AlertDescription>
              <strong>Email updated.</strong> Your email address successfully updated.
            </AlertDescription>
          </Alert>
        </Activity>

        <Activity mode={search.error ? 'visible' : 'hidden'}>
          <Alert variant='warning'>
            <Lucide.TriangleAlert className='size-4' />
            <AlertDescription>{search.error}</AlertDescription>
          </Alert>
        </Activity>

        <div>
          <h1 className='text-xl font-semibold'>Account Settings</h1>
          <p className='text-on-background-neutral mt-1 space-x-1 text-sm'>
            <span>User ID:</span>
            <Copy content={user.id}>{user.id}</Copy>
          </p>
        </div>

        <UserProfile {...user} />
        <ChangeEmail {...user} />
        <SocialAccounts />
        <SessionsList />
        <DeleteAccount />
      </div>
    </div>
  )
}
