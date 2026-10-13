import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link } from '@tanstack/react-router'
import { homeStyles, buttonStyles } from '#/styles/pages/site.stylex'

export const Route = createFileRoute('/(site)/')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: 'TanStack Start' }]
  }),
  staticData: { breadcrumb: 'Home' }
})

function RouteComponent() {
  return (
    <div {...stylex.props(homeStyles.container)}>
      <section {...stylex.props(homeStyles.hero)}>
        <div {...stylex.props(homeStyles.glow, homeStyles.glowPrimary)} />
        <div {...stylex.props(homeStyles.glow, homeStyles.glowPrimaryFaded)} />
        <p {...stylex.props(homeStyles.eyebrow)}>TanStack Start Base Template</p>
        <h1 {...stylex.props(homeStyles.heading)}>Start simple, ship quickly.</h1>
        <p {...stylex.props(homeStyles.description)}>
          This base starter intentionally keeps things light: two routes, clean structure, and the
          essentials you need to build from scratch.
        </p>
        <div {...stylex.props(homeStyles.ctaRow)}>
          <Link to='/about' {...stylex.props(buttonStyles.primary)}>
            About
          </Link>
          <a
            href='https://tanstack.com/start'
            {...stylex.props(buttonStyles.neutral)}
            rel='noopener noreferrer'
            target='_blank'
          >
            Docs
          </a>
        </div>
      </section>

      <section {...stylex.props(homeStyles.cardGrid)}>
        {[
          ['Type-Safe Routing', 'Routes and links stay in sync across every page.'],
          ['Server Functions', 'Call server code from your UI without creating API boilerplate.'],
          ['Streaming by Default', 'Ship progressively rendered responses for faster experiences.'],
          ['StyleX Styling', 'Type-safe, compile-time atomic styling with themed design tokens.']
        ].map(([title, desc], index) => (
          <article
            key={title}
            {...stylex.props(homeStyles.card)}
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 {...stylex.props(homeStyles.cardTitle)}>{title}</h2>
            <p {...stylex.props(homeStyles.cardDescription)}>{desc}</p>
          </article>
        ))}
      </section>

      <section {...stylex.props(homeStyles.quickStart)}>
        <p {...stylex.props(homeStyles.quickStartTitle)}>Quick Start</p>
        <ul {...stylex.props(homeStyles.quickStartList)}>
          <li>
            Edit <code>src/routes/(site)/index.tsx</code> to customize the home page.
          </li>
          <li>
            Add routes in <code>src/routes</code> and tweak visual tokens in{' '}
            <code>src/styles/core/colors.stylex.ts</code>.
          </li>
        </ul>
      </section>
    </div>
  )
}
