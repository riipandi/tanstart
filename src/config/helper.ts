/**
 * Sanitize raw env string:
 * - trim
 * - strip matching surrounding quotes repeatedly (`"'value'"` -> `value`)
 * - unescape common escape sequences (`\\n` -> `\n`, `\\t` -> `\t`, `\\r\\n` -> `\r\n`)
 */
function sanitizeEnv(value: string | undefined | null): string {
  if (value == null) return ''
  let s = String(value).trim()

  // treat literal "null" / "undefined" (case-insensitive) as empty
  const lower = s.toLowerCase()
  if (lower === 'null' || lower === 'undefined') return ''

  // strip matching surrounding quotes repeatedly
  while (
    s.length >= 2 &&
    ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))
  ) {
    s = s.slice(1, -1).trim()
  }

  // unescape backslashes first, then common escape sequences and escaped quotes
  s = s
    .replace(/\\\\/g, '\\') // double backslash -> single
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\r\\n/g, '\r\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')

  return s
}

/** parse boolean-like strings */
function parseBool(s: string, fallback: boolean): boolean {
  if (!s) return fallback
  const v = s.toLowerCase().trim()
  if (v === 'null' || v === 'undefined') return fallback
  if (['true', '1', 'yes', 'y', 'on'].includes(v)) return true
  if (['false', '0', 'no', 'n', 'off'].includes(v)) return false
  return fallback
}

/** parse numeric strings */
function parseNumber(s: string, fallback: number): number {
  if (!s) return fallback
  const v = s.trim().toLowerCase()
  if (v === 'null' || v === 'undefined') return fallback
  const n = Number(s)
  return Number.isFinite(n) ? n : fallback
}

/**
 * Generic parser for list-like env values.
 * Accepts:
 *  - actual array
 *  - JSON array string (`[1,2]` or `"[1,2]"`)
 *  - comma separated values (`a,b,c` or `[a,b]`)
 * Optionally pass `opts.default` to infer element type for casting.
 */
function parseListEnv<T = string>(
  raw: string | string[] | undefined | null,
  opts?: { default?: readonly T[] }
): T[] {
  const defaultArr = opts?.default ? [...opts.default] : []
  const inferType = defaultArr.length > 0 ? typeof defaultArr[0] : 'string'

  if (raw == null) return defaultArr

  // if already array, normalize items
  if (Array.isArray(raw)) {
    return raw
      .map((it) => String(it ?? '').trim())
      .filter(Boolean)
      .map((s) => castByType<T>(s, inferType))
  }

  const s = sanitizeEnv(raw)
  if (s === '') return defaultArr

  // handle quoted JSON arrays like '"[...]"'
  let maybeJson = s
  if (s.startsWith('"[') && s.endsWith(']"')) maybeJson = s.slice(1, -1)

  if (maybeJson.startsWith('[') && maybeJson.endsWith(']')) {
    try {
      const parsed = JSON.parse(maybeJson.replace(/'/g, '"'))
      if (Array.isArray(parsed)) return parseListEnv(parsed as string[], { default: defaultArr })
    } catch {
      // fall through to CSV parsing
    }
  }

  // CSV fallback (strip optional surrounding brackets)
  const items = s
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((it) => it.trim())
    .filter(Boolean)

  return items.map((it) => castByType<T>(it, inferType))
}

/** Cast string to target primitive type when possible */
function castByType<T>(s: string, inferType: string): T {
  if (inferType === 'number') {
    const n = Number(s)
    return (Number.isFinite(n) ? (n as unknown) : (s as unknown)) as T
  }
  if (inferType === 'boolean') {
    const v = s.toLowerCase()
    if (['true', '1', 'yes', 'y', 'on'].includes(v)) return true as unknown as T
    if (['false', '0', 'no', 'n', 'off'].includes(v)) return false as unknown as T
    return s as unknown as T
  }
  return s as unknown as T
}

/** Nullable helper: returns null when sanitized value is empty */
function nullableEnv(value: string | undefined | null, defaultValue?: string): string | null {
  const raw = value == null ? (defaultValue ?? '') : value
  const s = sanitizeEnv(raw)
  return s === '' ? null : s
}

/**
 * setEnv overloads:
 * - setEnv(value) -> string (sanitized)
 * - setEnv(value, default) -> typed value based on default's type (string|number|boolean|null|array)
 */
export function setEnv(value: string | undefined | null): string
export function setEnv<T extends string | number | boolean | null>(
  value: string | undefined | null,
  defaultValue: T
): T
export function setEnv<T extends readonly unknown[]>(
  value: string | undefined | null,
  defaultValue: T
): T
export function setEnv<T extends string | number | boolean | null | readonly unknown[]>(
  value: string | undefined | null,
  defaultValue?: T
) {
  // explicit null default => nullable behavior
  if (defaultValue === null) {
    return nullableEnv(value) as unknown as T
  }

  // no default => sanitized string
  if (defaultValue === undefined) {
    return sanitizeEnv(value) as unknown as T
  }

  const s = sanitizeEnv(value)

  if (Array.isArray(defaultValue)) {
    return parseListEnv(s, { default: defaultValue }) as unknown as T
  }

  if (typeof defaultValue === 'boolean') {
    return parseBool(s, defaultValue) as unknown as T
  }
  if (typeof defaultValue === 'number') {
    return parseNumber(s, defaultValue) as unknown as T
  }

  // string default
  return (s === '' ? defaultValue : (s as unknown)) as T
}

/** Convenience: parse env value as an array without passing `[] as string[]` */
export function setEnvArray<T = string>(
  value: string | undefined | null,
  defaultArr?: readonly T[]
): T[] {
  const raw = value == null ? undefined : value
  return parseListEnv<T>(raw, { default: defaultArr })
}
