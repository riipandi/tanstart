import * as stylex from '@stylexjs/stylex'
import { colors, radius } from '#/styles/core/colors.stylex'

export const themeSwitcherStyles = stylex.create({
  wrapper: {
    display: 'flex'
  },
  button: {
    borderRadius: radius.sm,
    padding: 8,
    transitionProperty: 'background-color, color',
    transitionDuration: '150ms',
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.backgroundNeutralFaded
    },
    color: {
      default: colors.foregroundNeutralFaded,
      ':hover': colors.foregroundNeutral
    }
  },
  icon: {
    width: 16,
    height: 16
  }
})
