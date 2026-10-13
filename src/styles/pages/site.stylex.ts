import * as stylex from '@stylexjs/stylex'
import {
  breakpoints,
  colors,
  fontSize,
  fontWeight,
  lineHeight,
  radius,
  shadow
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

export const pageStyles = stylex.create({
  page: {
    padding: 32
  },
  switcherPosition: {
    position: 'absolute',
    top: 16,
    right: 16
  }
})

export const homeStyles = stylex.create({
  container: {
    marginInline: 'auto',
    maxWidth: '64rem',
    padding: 16
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radius.xl,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.borderNeutral,
    backgroundColor: colors.backgroundElevationBase,
    paddingBlock: 40,
    paddingInline: {
      default: 24,
      [breakpoints.small]: 40
    },
    animationName: fadeSlideIn,
    animationDuration: '500ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'backwards'
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
    backgroundColor: 'oklch(from var(--backgroundPrimary) r g b / 0.2)'
  },
  glowPrimaryFaded: {
    bottom: -80,
    right: -80,
    backgroundColor: 'oklch(from var(--backgroundPrimaryFaded) r g b / 0.15)'
  },
  eyebrow: {
    color: colors.foregroundPrimary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 12
  },
  heading: {
    color: colors.foregroundNeutral,
    fontSize: {
      default: fontSize['4xl'],
      [breakpoints.small]: fontSize['6xl']
    },
    lineHeight: lineHeight.tight,
    fontWeight: fontWeight.bold,
    letterSpacing: '-0.025em',
    maxWidth: '48rem',
    marginBottom: 20
  },
  description: {
    color: colors.foregroundNeutralFaded,
    fontSize: {
      default: fontSize.base,
      [breakpoints.small]: fontSize.lg
    },
    maxWidth: '42rem',
    marginBottom: 32
  },
  ctaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12
  },
  cardGrid: {
    marginTop: 32,
    display: 'grid',
    gap: 16,
    gridTemplateColumns: {
      default: '1fr',
      [breakpoints.small]: 'repeat(2, minmax(0, 1fr))',
      [breakpoints.large]: 'repeat(4, minmax(0, 1fr))'
    }
  },
  card: {
    borderRadius: radius.lg,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.borderNeutral,
    backgroundColor: colors.backgroundElevationBase,
    padding: 20,
    animationName: fadeSlideIn,
    animationDuration: '500ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'backwards',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '200ms',
    transform: {
      default: 'translateY(0)',
      ':hover': 'translateY(-2px)'
    },
    boxShadow: {
      default: 'none',
      ':hover': shadow.raised
    }
  },
  cardTitle: {
    color: colors.foregroundNeutral,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: 8
  },
  cardDescription: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.sm,
    margin: 0
  },
  quickStart: {
    marginTop: 32,
    borderRadius: radius.lg,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.borderNeutral,
    backgroundColor: colors.backgroundElevationBase,
    padding: 24
  },
  quickStartTitle: {
    color: colors.foregroundPrimary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 8
  },
  quickStartList: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.sm,
    margin: 0,
    paddingInlineStart: 20,
    listStyleType: 'disc',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  }
})

export const aboutStyles = stylex.create({
  container: {
    marginInline: 'auto',
    maxWidth: '64rem',
    padding: 16
  },
  card: {
    borderRadius: radius.lg,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.borderNeutral,
    backgroundColor: colors.backgroundElevationBase,
    padding: {
      default: 24,
      [breakpoints.small]: 32
    }
  },
  eyebrow: {
    color: colors.foregroundPrimary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 8
  },
  heading: {
    color: colors.foregroundNeutral,
    fontSize: {
      default: fontSize['4xl'],
      [breakpoints.small]: fontSize['5xl']
    },
    fontWeight: fontWeight.bold,
    marginBottom: 12
  },
  description: {
    color: colors.foregroundNeutralFaded,
    fontSize: fontSize.base,
    lineHeight: lineHeight.relaxed,
    maxWidth: '48rem',
    margin: 0
  },
  ctaRow: {
    marginTop: 24
  }
})

export const ctaRowStyles = stylex.create({
  responsive: {
    display: 'flex',
    flexDirection: {
      default: 'column',
      [breakpoints.small]: 'row'
    },
    alignItems: 'center',
    justifyContent: {
      default: 'center',
      [breakpoints.small]: 'center'
    },
    gap: 12
  }
})

export const buttonStyles = stylex.create({
  primary: {
    display: 'inline-block',
    borderRadius: radius.full,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    backgroundColor: {
      default: colors.backgroundPrimaryFaded,
      ':hover': 'oklch(from var(--backgroundPrimaryFaded) r g b / 0.6)'
    },
    color: colors.foregroundPrimary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    paddingBlock: 10,
    paddingInline: 20,
    textDecoration: 'none',
    transitionProperty: 'transform, background-color',
    transitionDuration: '150ms',
    transform: {
      default: 'translateY(0)',
      ':hover': 'translateY(-2px)'
    }
  },
  critical: {
    display: 'inline-block',
    borderRadius: radius.full,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.borderCritical,
    backgroundColor: {
      default: colors.backgroundCriticalFaded,
      ':hover': 'oklch(from var(--backgroundCriticalFaded) r g b / 0.6)'
    },
    color: colors.foregroundCritical,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    paddingBlock: 10,
    paddingInline: 20,
    textDecoration: 'none',
    cursor: 'pointer',
    transitionProperty: 'transform, background-color',
    transitionDuration: '150ms',
    transform: {
      default: 'translateY(0)',
      ':hover': 'translateY(-2px)'
    }
  },
  neutral: {
    display: 'inline-block',
    borderRadius: radius.full,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: {
      default: colors.borderNeutral,
      ':hover': colors.borderNeutralFaded
    },
    backgroundColor: 'oklch(from var(--backgroundElevationBase) r g b / 0.5)',
    color: colors.foregroundNeutral,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    paddingBlock: 10,
    paddingInline: 20,
    textDecoration: 'none',
    transitionProperty: 'transform, border-color',
    transitionDuration: '150ms',
    transform: {
      default: 'translateY(0)',
      ':hover': 'translateY(-2px)'
    }
  }
})
