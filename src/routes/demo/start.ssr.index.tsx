import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/demo/start/ssr/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className='bg-background-page flex min-h-screen items-center justify-center p-4'>
      <div className='border-sidebar-border/10 bg-sidebar/50 w-full max-w-2xl rounded-xl border-8 p-8 shadow-lg backdrop-blur-md'>
        <h1 className='mb-8 bg-linear-to-r from-pink-500 via-purple-500 to-green-400 bg-clip-text text-center text-4xl font-bold text-transparent'>
          SSR Demos
        </h1>
        <div className='flex flex-col gap-4'>
          <Link
            to='/demo/start/ssr/spa-mode'
            className='transform rounded-lg border-2 border-pink-400 bg-linear-to-r from-pink-600 to-pink-500 px-8 py-6 text-center text-2xl font-bold text-white shadow-md transition-all hover:scale-105 hover:from-pink-700 hover:to-pink-600 hover:shadow-pink-500/50'
          >
            SPA Mode
          </Link>
          <Link
            to='/demo/start/ssr/full-ssr'
            className='transform rounded-lg border-2 border-purple-400 bg-linear-to-r from-purple-600 to-purple-500 px-8 py-6 text-center text-2xl font-bold text-white shadow-md transition-all hover:scale-105 hover:from-purple-700 hover:to-purple-600 hover:shadow-purple-500/50'
          >
            Full SSR
          </Link>
          <Link
            to='/demo/start/ssr/data-only'
            className='transform rounded-lg border-2 border-green-400 bg-linear-to-r from-green-500 to-emerald-500 px-8 py-6 text-center text-2xl font-bold text-white shadow-md transition-all hover:scale-105 hover:from-green-600 hover:to-emerald-600 hover:shadow-green-500/50'
          >
            Data Only
          </Link>
        </div>
      </div>
    </div>
  )
}
