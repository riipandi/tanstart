import { Session } from '#/guards/auth-client'

export function UserProfile(user: Session['user']) {
  return (
    <div className='border-border-neutral rounded-lg border p-6'>
      <div className='flex items-center justify-start gap-4'>
        <div className='border-border-neutral h-full w-auto rounded-full border bg-white p-2'>
          <img
            src={user.image || `https://api.dicebear.com/9.x/adventurer/svg?seed=${user.name}`}
            className='size-14 rounded-full'
            alt={user.name}
          />
        </div>
        <div className='space-y-1.5'>
          <div>
            <p className='text-on-background-neutral font-medium'>{user.name}</p>
            <p className='text-sm font-medium'>{user.email}</p>
          </div>
          <div>
            <p className='text-xs font-medium'>
              Member since {user.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
