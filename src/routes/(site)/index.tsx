import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/(site)/')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: 'TanStack Start' }]
  }),
  staticData: { breadcrumb: 'Home' }
})

function RouteComponent() {
  return (
    <div className='mx-auto max-w-5xl p-4'>
      <section className='bg-background-elevation-base border border-border-neutral animate-in fade-in slide-in-from-bottom-3 duration-500 relative overflow-hidden rounded-xl px-6 py-10 sm:px-10 sm:py-14'>
        <div className='pointer-events-none absolute -top-24 -left-20 h-56 w-56 rounded-full bg-background-primary/20 blur-3xl' />
        <div className='pointer-events-none absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-background-primary-faded/15 blur-3xl' />
        <p className='text-foreground-primary text-xs font-semibold uppercase tracking-widest mb-3'>
          TanStack Start Base Template
        </p>
        <h1 className='mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-foreground-neutral sm:text-6xl'>
          Start simple, ship quickly.
        </h1>
        <p className='mb-8 max-w-2xl text-base text-foreground-neutral-faded sm:text-lg'>
          This base starter intentionally keeps things light: two routes, clean structure, and the
          essentials you need to build from scratch.
        </p>
        <div className='flex flex-wrap gap-3'>
          <Link
            to='/about'
            className='rounded-full border border-border-primary bg-background-primary-faded px-5 py-2.5 text-sm font-semibold text-foreground-primary no-underline transition hover:-translate-y-0.5 hover:bg-background-primary-faded/60'
          >
            About
          </Link>
          <a
            href='https://tanstack.com/start'
            className='rounded-full border border-border-neutral bg-background-elevation-base/50 px-5 py-2.5 text-sm font-semibold text-foreground-neutral no-underline transition hover:-translate-y-0.5 hover:border-foreground-neutral-faded'
            rel='noopener noreferrer'
            target='_blank'
          >
            Docs
          </a>
        </div>
      </section>

      <section className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[
          ['Type-Safe Routing', 'Routes and links stay in sync across every page.'],
          ['Server Functions', 'Call server code from your UI without creating API boilerplate.'],
          ['Streaming by Default', 'Ship progressively rendered responses for faster experiences.'],
          ['Tailwind Native', 'Design quickly with utility-first styling and reusable tokens.']
        ].map(([title, desc], index) => (
          <article
            key={title}
            className='bg-background-elevation-base border border-border-neutral transition-all hover:shadow-raised hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-3 duration-500 rounded-2xl p-5'
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className='text-foreground-neutral mb-2 text-base font-semibold'>{title}</h2>
            <p className='text-foreground-neutral-faded m-0 text-sm'>{desc}</p>
          </article>
        ))}
      </section>

      <section className='bg-background-elevation-base border border-border-neutral mt-8 rounded-2xl p-6'>
        <p className='text-foreground-primary text-xs font-semibold uppercase tracking-widest mb-2'>
          Quick Start
        </p>
        <ul className='text-foreground-neutral-faded m-0 list-disc space-y-2 pl-5 text-sm'>
          <li>
            Edit <code>app/routes/(site)/index.tsx</code> to customize the home page.
          </li>
          <li>
            Add routes in <code>src/routes</code> and tweak visual tokens in{' '}
            <code>src/styles/theme.css</code>.
          </li>
        </ul>
      </section>
    </div>
  )
}
