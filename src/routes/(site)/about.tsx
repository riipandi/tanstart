import * as stylex from '@stylexjs/stylex'
import { createFileRoute, Link } from '@tanstack/react-router'
import { aboutStyles, buttonStyles } from '#/styles/pages/site.stylex'

export const Route = createFileRoute('/(site)/about')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: 'About - TanStack Start' }]
  }),
  staticData: { breadcrumb: 'About' }
})

function RouteComponent() {
  return (
    <div {...stylex.props(aboutStyles.container)}>
      <section {...stylex.props(aboutStyles.card)}>
        <p {...stylex.props(aboutStyles.eyebrow)}>About</p>
        <h1 {...stylex.props(aboutStyles.heading)}>A small starter with room to grow.</h1>
        <p {...stylex.props(aboutStyles.description)}>
          TanStack Start gives you type-safe routing, server functions, and modern SSR defaults. Use
          this as a clean foundation, then layer in your own routes, styling, and add-ons.
        </p>
        <div {...stylex.props(aboutStyles.ctaRow)}>
          <Link to='/' {...stylex.props(buttonStyles.neutral)}>
            &larr; Back
          </Link>
        </div>
      </section>
    </div>
  )
}
