/**
 * Color tokens — values are the light theme. `themes.ts` overrides them
 * for dark mode with a single `stylex.createTheme`; components never
 * branch on the color scheme.
 *
 * Common props for component: color, variant, size
 * Colors (neutral by default): primary|neutral|positive|warning|critical
 * Variants by color: solid|faded|outline|ghost
 */

import * as stylex from '@stylexjs/stylex'

export const colors = stylex.defineVars({
  // Colors that available on light and dark mode
  black: 'oklch(0 0 0)',
  white: 'oklch(1 0 0)',
  brand: 'oklch(0.557 0.224 277)',
  onBrand: 'oklch(1 0 0)',
  onBackgroundPrimary: 'oklch(1 0 0)',
  onBackgroundCritical: 'oklch(1 0 0)',
  onBackgroundWarning: 'oklch(0 0 0)',
  onBackgroundPositive: 'oklch(1 0 0)',

  // Themed color variables (light values; dark values live in themes.ts)
  backgroundPage: 'oklch(1 0 0)',
  backgroundPageFaded: 'oklch(0.983 0.003 287)',
  backgroundNeutral: 'oklch(0.913 0.011 270)',
  backgroundNeutralFaded: 'oklch(0.965 0.003 287)',
  backgroundPrimary: 'oklch(0.578 0.206 263)',
  backgroundPrimaryFaded: 'oklch(0.953 0.021 262)',
  backgroundCritical: 'oklch(0.592 0.216 27)',
  backgroundCriticalFaded: 'oklch(0.959 0.017 18)',
  backgroundWarning: 'oklch(0.861 0.173 92)',
  backgroundWarningFaded: 'oklch(0.984 0.023 93)',
  backgroundPositive: 'oklch(0.553 0.13 156)',
  backgroundPositiveFaded: 'oklch(0.98 0.02 164)',
  backgroundDisabled: 'oklch(0.949 0.006 265)',
  backgroundDisabledFaded: 'oklch(0.973 0.004 272)',
  backgroundElevationBase: 'oklch(1 0 0)',
  backgroundElevationRaised: 'oklch(1 0 0)',
  backgroundElevationOverlay: 'oklch(1 0 0)',
  foregroundNeutral: 'oklch(0.208 0.015 262)',
  foregroundNeutralFaded: 'oklch(0.51 0.041 266)',
  foregroundPrimary: 'oklch(0.573 0.234 265)',
  foregroundCritical: 'oklch(0.533 0.194 27)',
  foregroundWarning: 'oklch(0.509 0.102 92)',
  foregroundPositive: 'oklch(0.496 0.117 156)',
  foregroundDisabled: 'oklch(0.845 0.02 267)',
  borderNeutral: 'oklch(0 0 0 / 0.12)',
  borderNeutralFaded: 'oklch(0 0 0 / 0.08)',
  borderPrimary: 'oklch(0.546 0.215 263)',
  borderPrimaryFaded: 'oklch(0.932 0.032 256)',
  borderCritical: 'oklch(0.523 0.19 27)',
  borderCriticalFaded: 'oklch(0.908 0.028 29)',
  borderWarning: 'oklch(0.748 0.15 92)',
  borderWarningFaded: 'oklch(0.913 0.041 92)',
  borderPositive: 'oklch(0.475 0.112 156)',
  borderPositiveFaded: 'oklch(0.921 0.037 156)',
  borderDisabled: 'oklch(0.913 0.011 270)',
  onBackgroundNeutral: 'oklch(0 0 0)'
})

// -----------------------------------------------------------------------------
// Shadow variables
// -----------------------------------------------------------------------------

export const shadow = stylex.defineVars({
  raised: '0px 1px 5px -4px rgba(0, 0, 0, 0.5), 0px 4px 8px 0px rgba(0, 0, 0, 0.05)',
  overlay: '0px 5px 10px 0px rgba(0, 0, 0, 0.05), 0px 15px 25px 0px rgba(0, 0, 0, 0.07)'
})

// -----------------------------------------------------------------------------
// Border radius constants
// -----------------------------------------------------------------------------

export const radius = stylex.defineConsts({
  base: '0.5rem',
  xs: '0.375rem',
  sm: '0.55rem',
  md: '0.5rem',
  lg: '0.65rem',
  xl: '0.85rem',
  full: '999px',
  none: '0px'
})

// -----------------------------------------------------------------------------
// Typography constants
// -----------------------------------------------------------------------------

export const fontFamily = stylex.defineConsts({
  sans: '"Mona Sans Variable", system-ui, -apple-system, Roboto, Aptos, Helvetica, sans-serif',
  mono: '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
})

export const fontSize = stylex.defineConsts({
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.375rem',
  '3xl': '1.75rem',
  '4xl': '2.25rem',
  '5xl': '2.75rem',
  '6xl': '3.25rem'
})

export const fontWeight = stylex.defineConsts({
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700
})

export const lineHeight = stylex.defineConsts({
  tight: 1.02,
  snug: 1.25,
  normal: 1.5,
  relaxed: 2
})

// -----------------------------------------------------------------------------
// Breakpoint constants
// -----------------------------------------------------------------------------

export const breakpoints = stylex.defineConsts({
  small: '@media (min-width: 640px)',
  medium: '@media (min-width: 768px)',
  large: '@media (min-width: 1024px)',
  xlarge: '@media (min-width: 1280px)'
})

export const spacing = stylex.defineConsts({
  x0: '0px',
  x1: '4px',
  x2: '8px',
  x3: '12px',
  x4: '16px',
  x5: '20px',
  x6: '24px',
  x8: '32px',
  x10: '40px',
  x12: '48px',
  x14: '56px'
})
