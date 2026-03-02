import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'

export function GlobalNotFound() {
  return (
    <div className='bg-background-page flex min-h-[50vh] flex-col items-center justify-center px-4'>
      <div className='text-center'>
        <div className='mb-6 flex justify-center'>
          <div className='bg-background-neutral-faded rounded-full p-6'>
            <Lucide.FileX className='text-foreground-neutral-faded h-16 w-16' />
          </div>
        </div>
        <h1 className='text-foreground-neutral mb-3 text-4xl font-bold'>404</h1>
        <p className='text-on-background-neutral mb-8 text-lg'>
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link
          to='/'
          className='bg-background-primary text-on-brand hover:bg-background-primary/80 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors'
        >
          <Lucide.Home className='h-4 w-4' />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
