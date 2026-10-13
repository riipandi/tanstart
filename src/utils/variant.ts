/**
 * Advanced Tailwind Variants wrapper that extends the default configuration.
 * For smaller bundle size (~80% smaller), use the `tailwind-variants/lite`
 * which doesn't include tailwind-merge.
 *
 * @see: https://www.tailwind-variants.org/docs/config
 */

import type { TV } from 'tailwind-variants'
import { createTV } from 'tailwind-variants'

export const tv: TV = createTV({ twMerge: true })

// Re-export types and utilities for convenience
export type { VariantProps } from 'tailwind-variants'
export { cn as clx } from 'tailwind-variants'
