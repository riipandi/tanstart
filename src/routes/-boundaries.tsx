import * as stylex from '@stylexjs/stylex'
import { Link, type ErrorComponentProps } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Activity } from 'react'
import { boundariesStyles } from '#/styles/pages/boundaries.stylex'
import { buttonStyles, ctaRowStyles } from '#/styles/pages/site.stylex'

export function GlobalNotFound() {
  return (
    <main {...stylex.props(boundariesStyles.main)}>
      <section {...stylex.props(boundariesStyles.section, boundariesStyles.notFoundSection)}>
        <div {...stylex.props(boundariesStyles.glow, boundariesStyles.glowPrimary)} />
        <div {...stylex.props(boundariesStyles.glow, boundariesStyles.glowPrimaryFaded)} />

        <Lucide.SearchX {...stylex.props(boundariesStyles.icon)} strokeWidth={1.5} />

        <p {...stylex.props(boundariesStyles.eyebrow, boundariesStyles.eyebrowPrimary)}>
          Error 404
        </p>

        <h1 {...stylex.props(boundariesStyles.heading)}>Page not found</h1>

        <p {...stylex.props(boundariesStyles.description)}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div {...stylex.props(ctaRowStyles.responsive)}>
          <Link to='/' {...stylex.props(buttonStyles.primary)}>
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  )
}

export function GlobalError({ error, reset }: ErrorComponentProps) {
  const errorMessage =
    error instanceof Error ? error.message : typeof error === 'string' ? error : ''

  return (
    <main {...stylex.props(boundariesStyles.main)}>
      <section {...stylex.props(boundariesStyles.section, boundariesStyles.errorSection)}>
        <div {...stylex.props(boundariesStyles.glow, boundariesStyles.glowCritical)} />
        <div {...stylex.props(boundariesStyles.glow, boundariesStyles.glowCriticalFaded)} />

        <Lucide.AlertCircle
          {...stylex.props(boundariesStyles.icon, boundariesStyles.iconCritical)}
          strokeWidth={1.5}
        />

        <p {...stylex.props(boundariesStyles.eyebrow, boundariesStyles.eyebrowCritical)}>
          Unexpected error
        </p>

        <h1 {...stylex.props(boundariesStyles.heading)}>Something went wrong</h1>

        <p {...stylex.props(boundariesStyles.description)}>
          An unexpected error occurred. You can try again or go back to the home page.
        </p>

        <Activity mode={errorMessage ? 'visible' : 'hidden'}>
          <div {...stylex.props(boundariesStyles.errorBox)}>
            <code {...stylex.props(boundariesStyles.errorCode)}>{errorMessage}</code>
          </div>
        </Activity>

        <div {...stylex.props(ctaRowStyles.responsive)}>
          <button type='button' onClick={reset} {...stylex.props(buttonStyles.critical)}>
            Try again
          </button>
          <Link to='/' {...stylex.props(buttonStyles.neutral)}>
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  )
}
