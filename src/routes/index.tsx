import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const features = [
    {
      icon: <Lucide.Zap className='text-sidebar-primary h-12 w-12' />,
      title: 'Powerful Server Functions',
      description:
        'Write server-side code that seamlessly integrates with your client components. Type-safe, secure, and simple.'
    },
    {
      icon: <Lucide.Server className='text-sidebar-primary h-12 w-12' />,
      title: 'Flexible Server Side Rendering',
      description:
        'Full-document SSR, streaming, and progressive enhancement out of the box. Control exactly what renders where.'
    },
    {
      icon: <Lucide.Route className='text-sidebar-primary h-12 w-12' />,
      title: 'API Routes',
      description:
        'Build type-safe API endpoints alongside your application. No separate backend needed.'
    },
    {
      icon: <Lucide.Shield className='text-sidebar-primary h-12 w-12' />,
      title: 'Strongly Typed Everything',
      description:
        'End-to-end type safety from server to client. Catch errors before they reach production.'
    },
    {
      icon: <Lucide.Waves className='text-sidebar-primary h-12 w-12' />,
      title: 'Full Streaming Support',
      description:
        'Stream data from server to client progressively. Perfect for AI applications and real-time updates.'
    },
    {
      icon: <Lucide.Sparkles className='text-sidebar-primary h-12 w-12' />,
      title: 'Next Generation Ready',
      description:
        'Built from the ground up for modern web applications. Deploy anywhere JavaScript runs.'
    }
  ]

  return (
    <div className='bg-background-page min-h-screen'>
      <section className='relative overflow-hidden px-6 py-20 text-center'>
        <div className='from-background-primary-faded/10 via-background-primary/10 to-background-positive-faded/10 absolute inset-0 bg-linear-to-r'></div>
        <div className='relative mx-auto max-w-5xl'>
          <div className='mb-6 flex items-center justify-center gap-6'>
            <img
              src='/tanstack-circle-logo.png'
              alt='TanStack Logo'
              className='h-24 w-24 md:h-32 md:w-32'
            />
            <h1 className='text-sidebar-foreground text-6xl font-black tracking-[-0.08em] md:text-7xl'>
              <span className='text-on-background-neutral'>TANSTACK</span>{' '}
              <span className='from-background-primary to-background-positive bg-linear-to-r bg-clip-text text-transparent'>
                START
              </span>
            </h1>
          </div>
          <p className='text-on-background-neutral mb-4 text-2xl font-light md:text-3xl'>
            The framework for next generation AI applications
          </p>
          <p className='text-on-background-neutral mx-auto mb-8 max-w-3xl text-lg'>
            Full-stack framework powered by TanStack Router for React and Solid. Build modern
            applications with server functions, streaming, and type safety.
          </p>
          <div className='flex flex-col items-center gap-4'>
            <a
              href='https://tanstack.com/start'
              target='_blank'
              rel='noopener noreferrer'
              className='bg-background-primary text-on-brand shadow-background-primary/30 hover:bg-background-primary/80 rounded-lg px-8 py-3 font-semibold shadow-lg transition-colors'
            >
              Documentation
            </a>
            <p className='text-on-background-neutral mt-2 text-sm'>
              Begin your TanStack Start journey by editing{' '}
              <code className='bg-sidebar-accent text-background-primary rounded px-2 py-1'>
                /src/routes/index.tsx
              </code>
            </p>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-7xl px-6 py-16'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='border-sidebar-border bg-sidebar hover:border-background-primary hover:shadow-background-primary/10 rounded-xl border p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg'
            >
              <div className='mb-4'>{feature.icon}</div>
              <h3 className='text-sidebar-foreground mb-3 text-xl font-semibold'>
                {feature.title}
              </h3>
              <p className='text-on-background-neutral leading-relaxed'>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
