import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'

export function GlobalNotFound() {
  return (
    <div className='bg-background-page flex min-h-[50vh] flex-col items-center justify-center px-6 py-16'>
      <div className='text-center'>
        <div className='mb-6 flex justify-center'>
          <div className='bg-background-neutral-faded rounded-lg p-4'>
            <Lucide.FileX className='text-foreground-neutral-faded h-10 w-10' />
          </div>
        </div>
        <h1 className='text-foreground-primary mb-3 text-4xl font-bold'>404</h1>
        <p className='text-on-background-neutral mb-8 text-base'>
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link
          to='/'
          className='bg-background-primary text-on-brand hover:bg-background-primary/80 focus:ring-border-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus:ring-2 focus:outline-none'
        >
          <Lucide.Home className='size-4' />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
