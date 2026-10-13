import * as stylex from '@stylexjs/stylex'
import {
  breakpoints,
  colors,
  fontFamily,
  fontSize,
  fontWeight,
  radius
} from '../core/colors.stylex'

const fadeSlideIn = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(12px)'
  },
  to: {
    opacity: 1,
    transform: 'translateY(0)'
  }
})

export const boundariesStyles = stylex.create({
  main: {
    marginInline: 'auto',
    minHeight: '100vh',
    maxWidth: '64rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: 48,
    paddingInline: 16
  },
  section: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: colors.backgroundElevationBase,
    paddingBlock: 56,
    paddingInline: {
      default: 24,
      [breakpoints.small]: 40
    },
    textAlign: 'center',
    animationName: fadeSlideIn,
    animationDuration: '500ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'backwards'
  },
  notFoundSection: {
    borderColor: colors.borderNeutral
  },
  errorSection: {
    borderColor: 'oklch(from var(--borderCritical) r g b / 0.2)'
  },
  glow: {
    pointerEvents: 'none',
    position: 'absolute',
    width: 224,
    height: 224,
    borderRadius: radius.full,
    filter: 'blur(64px)'
  },
  glowPrimary: {
    top: -96,
    left: -80,
    backgroundColor: 'oklch(from var(--backgroundPrimary) r g b / 0.1)'
  },
  glowPrimaryFaded: {
    bottom: -80,
    right: -80,
    backgroundColor: 'oklch(from var(--backgroundPrimaryFaded) r g b / 0.1)'
  },
  glowCritical: {
    top: -96,
    right: -80,
    backgroundColor: 'oklch(from var(--backgroundCritical) r g b / 0.1)'
  },
  glowCriticalFaded: {
    bottom: -80,
    left: -80,
    backgroundColor: 'oklch(from var(--backgroundCriticalFaded) r g b / 0.1)'
  },
  icon: {
    marginBlock: 0,
    marginInline: 'auto',
    marginBottom: 24,
    width: 56,
    height: 56,
    color: 'oklch(from var(--foregroundPrimary) r g b / 0.5)'
  },
  iconCritical: {
    color: 'oklch(from var(--foregroundCritical) r g b / 0.5)'
  },
  eyebrow: {
    marginBottom: 12,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
  },
  eyebrowPrimary: {
    color: colors.foregroundPrimary
  },
  eyebrowCritical: {
    color: colors.foregroundCritical
  },
  heading: {
    color: colors.foregroundNeutral,
    fontSize: {
      default: fontSize['4xl'],
      [breakpoints.small]: fontSize['5xl']
    },
    fontWeight: fontWeight.bold,
    letterSpacing: '-0.025em',
    marginBottom: 12
  },
  description: {
    color: colors.foregroundNeutralFaded,
    fontSize: {
      default: fontSize.sm,
      [breakpoints.small]: fontSize.base
    },
    marginBlock: 0,
    marginInline: 'auto',
    marginBottom: 32,
    maxWidth: '28rem'
  },
  errorBox: {
    marginInline: 'auto',
    marginBottom: 32,
    maxWidth: '32rem',
    borderRadius: radius.sm,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.borderNeutral,
    backgroundColor: colors.backgroundPage,
    padding: 16,
    textAlign: 'left'
  },
  errorCode: {
    display: 'block',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xs,
    color: colors.foregroundCritical
  },
  ctaRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12
  }
})
