/**
 * Dark theme — a single `stylex.createTheme` per variable group. Values are
 * static by design: StyleX resolves `createTheme` at compile time, so add
 * variations by writing more `createTheme` calls here, not by computing them
 * at runtime. A theme need not override every token: a partial one composes
 * with a full one and the later theme wins per token, e.g.
 * `stylex.props(darkTheme, brandTheme)`.
 */

import * as stylex from '@stylexjs/stylex'
import { colors, shadow } from './colors.stylex'

const darkColors = stylex.createTheme(colors, {
  backgroundPage: 'oklch(0.178 0.011 268)',
  backgroundPageFaded: 'oklch(0.187 0.013 271)',
  backgroundNeutral: 'oklch(0.429 0.029 270)',
  backgroundNeutralFaded: 'oklch(0.277 0.026 265)',
  backgroundPrimary: 'oklch(0.578 0.206 263)',
  backgroundPrimaryFaded: 'oklch(0.251 0.052 282)',
  backgroundCritical: 'oklch(0.555 0.204 27)',
  backgroundCriticalFaded: 'oklch(0.282 0.048 21)',
  backgroundWarning: 'oklch(0.838 0.169 92)',
  backgroundWarningFaded: 'oklch(0.276 0.016 80)',
  backgroundPositive: 'oklch(0.507 0.114 157)',
  backgroundPositiveFaded: 'oklch(0.272 0.02 157)',
  backgroundDisabled: 'oklch(0.249 0.018 271)',
  backgroundDisabledFaded: 'oklch(0.215 0.016 274)',
  backgroundElevationBase: 'oklch(0.206 0.014 273)',
  backgroundElevationRaised: 'oklch(0.224 0.016 274)',
  backgroundElevationOverlay: 'oklch(0.24 0.018 271)',
  foregroundNeutral: 'oklch(0.958 0.006 265)',
  foregroundNeutralFaded: 'oklch(0.827 0.023 269)',
  foregroundPrimary: 'oklch(0.714 0.143 255)',
  foregroundCritical: 'oklch(0.693 0.169 23)',
  foregroundWarning: 'oklch(0.672 0.135 92)',
  foregroundPositive: 'oklch(0.654 0.154 156)',
  foregroundDisabled: 'oklch(0.406 0.028 269)',
  borderNeutral: 'oklch(1 0 0 / 0.14)',
  borderNeutralFaded: 'oklch(1 0 0 / 0.08)',
  borderPrimary: 'oklch(0.714 0.143 255)',
  borderPrimaryFaded: 'oklch(0.346 0.074 256)',
  borderCritical: 'oklch(0.693 0.172 23)',
  borderCriticalFaded: 'oklch(0.357 0.065 28)',
  borderWarning: 'oklch(0.672 0.136 92)',
  borderWarningFaded: 'oklch(0.358 0.047 93)',
  borderPositive: 'oklch(0.656 0.148 157)',
  borderPositiveFaded: 'oklch(0.357 0.049 155)',
  borderDisabled: 'oklch(0.285 0.019 268)',
  onBackgroundNeutral: 'oklch(1 0 0)'
})

const darkShadows = stylex.createTheme(shadow, {
  raised: '0px 8px 12px -4px rgba(0, 0, 0, 0.08), 0px -1.5px 2px -1px rgba(255, 255, 255, 0.1)',
  overlay:
    '0px 16px 24px -4px rgba(0, 0, 0, 0.12), 0px 8px 12px -4px rgba(0, 0, 0, 0.12), 0px 8px 6px -4px rgba(0, 0, 0, 0.12)'
})

/**
 * Compiled class names for the dark theme, applied to `documentElement` by
 * the ThemeProvider. Themes are applied to the root element (not a wrapper):
 * dialogs and popovers portal out and would escape a subtree theme.
 */
export const darkThemeClass = stylex.props(darkColors, darkShadows).className ?? ''

export { darkColors, darkShadows }
