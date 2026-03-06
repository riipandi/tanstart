/**
 * Safe redirect URL validation utilities
 */

/**
 * Validates and returns a safe redirect URL.
 * Only allows same-origin relative paths to prevent open redirect vulnerabilities.
 *
 * @param redirect - The redirect URL to validate
 * @param fallback - Default URL to return if validation fails
 * @returns A safe redirect URL
 *
 * @example
 * ```ts
 * getSafeRedirect('/dashboard') // '/dashboard'
 * getSafeRedirect('https://evil.com') // '/dashboard' (fallback)
 * getSafeRedirect('//evil.com') // '/dashboard' (fallback)
 * getSafeRedirect('/account/settings') // '/account/settings'
 * ```
 */
export function getSafeRedirect(
  redirect: string | null | undefined,
  fallback: string = '/dashboard'
): string {
  if (!redirect) return fallback

  // Remove leading/trailing whitespace
  const trimmed = redirect.trim()

  // Block empty strings
  if (!trimmed) return fallback

  // Block protocol-relative URLs (//evil.com)
  if (trimmed.startsWith('//')) return fallback

  // Block absolute URLs with protocols (https://, http://, javascript:, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return fallback

  // Only allow relative paths starting with /
  if (trimmed.startsWith('/')) {
    return trimmed
  }

  // Block anything else
  return fallback
}
