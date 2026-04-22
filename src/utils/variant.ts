/**
 * Advanced Tailwind Variants wrapper that extends the default configuration.
 * For smaller bundle size (~80% smaller), use the `tailwind-variants/lite`
 * which doesn't include tailwind-merge.
 *
 * @see: https://www.tailwind-variants.org/docs/config
 */

import type { TV, TWMergeConfig } from 'tailwind-variants'
import { createTV } from 'tailwind-variants'

const twMergeConfig: TWMergeConfig = { cacheSize: 1024, prefix: undefined }

export const tv: TV = createTV({ twMerge: true, twMergeConfig })

// Re-export types and utilities for convenience
export type { VariantProps } from 'tailwind-variants'
export { cn as clx } from 'tailwind-variants'
