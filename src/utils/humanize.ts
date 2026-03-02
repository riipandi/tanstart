/**
 * Portions of this code are adapted from the following libraries:
 *
 * - pretty-bytes — Convert bytes to human readable strings.
 *   @see https://github.com/sindresorhus/pretty-bytes
 *   @license MIT
 *
 * - pretty-ms — Convert milliseconds to human readable strings.
 *   @see https://github.com/sindresorhus/pretty-ms
 *   @license MIT
 *
 * - parse-ms — Parse milliseconds into components.
 *   @see https://github.com/sindresorhus/parse-ms
 *   @license MIT
 *
 * - parse-duration-ms — Parse duration strings to milliseconds.
 *   @see https://github.com/sindresorhus/parse-duration-ms
 *   @license MIT
 *
 * The implementations in this project include adapted portions from
 * the libraries listed above. The original code from these libraries
 * are licensed under the MIT license.
 */

type TimeComponents<T extends number | bigint = number> = {
  days: T
  hours: T
  minutes: T
  seconds: T
  milliseconds: T
  microseconds: T
  nanoseconds: T
}

const toZeroIfInfinity = (value: number): number => (Number.isFinite(value) ? value : 0)

function parseNumber(milliseconds: number): TimeComponents<number> {
  return {
    days: Math.trunc(milliseconds / 86_400_000),
    hours: Math.trunc((milliseconds / 3_600_000) % 24),
    minutes: Math.trunc((milliseconds / 60_000) % 60),
    seconds: Math.trunc((milliseconds / 1000) % 60),
    milliseconds: Math.trunc(milliseconds % 1000),
    microseconds: Math.trunc(toZeroIfInfinity(milliseconds * 1000) % 1000),
    nanoseconds: Math.trunc(toZeroIfInfinity(milliseconds * 1e6) % 1000)
  }
}

function parseBigint(milliseconds: bigint): TimeComponents<bigint> {
  return {
    days: milliseconds / 86_400_000n,
    hours: (milliseconds / 3_600_000n) % 24n,
    minutes: (milliseconds / 60_000n) % 60n,
    seconds: (milliseconds / 1000n) % 60n,
    milliseconds: milliseconds % 1000n,
    microseconds: 0n,
    nanoseconds: 0n
  }
}

/**
Parse milliseconds into an object.
*/
function parseMilliseconds<T extends number | bigint>(milliseconds: T): TimeComponents<T> {
  switch (typeof milliseconds) {
    case 'number': {
      if (Number.isFinite(milliseconds as number)) {
        return parseNumber(milliseconds as number) as TimeComponents<T>
      }

      break
    }

    case 'bigint': {
      return parseBigint(milliseconds as bigint) as TimeComponents<T>
    }

    // No default
  }

  throw new TypeError('Expected a finite number or bigint')
}

type PrettyMsOptions = {
  readonly secondsDecimalDigits?: number
  readonly millisecondsDecimalDigits?: number
  readonly keepDecimalsOnWholeSeconds?: boolean
  readonly compact?: boolean
  readonly unitCount?: number
  readonly verbose?: boolean
  readonly separateMilliseconds?: boolean
  readonly formatSubMilliseconds?: boolean
  readonly colonNotation?: boolean
  readonly hideYear?: boolean
  readonly hideYearAndDays?: boolean
  readonly hideSeconds?: boolean
  readonly subSecondsAsDecimals?: boolean
}

type Numeric = number | bigint

const isZero = (value: Numeric): boolean => (typeof value === 'number' ? value === 0 : value === 0n)
const pluralize = (word: string, count: Numeric): string =>
  typeof count === 'number' ? (count === 1 ? word : `${word}s`) : count === 1n ? word : `${word}s`

const SECOND_ROUNDING_EPSILON = 0.000_000_1
const ONE_DAY_IN_MILLISECONDS = 24n * 60n * 60n * 1000n

type MutableOptions = { -readonly [K in keyof PrettyMsOptions]?: PrettyMsOptions[K] }

function prettyMs(milliseconds: number | bigint, options?: PrettyMsOptions): string {
  const isBigInt = typeof milliseconds === 'bigint'
  if (!isBigInt && !Number.isFinite(milliseconds as number)) {
    throw new TypeError('Expected a finite number or bigint')
  }

  const opts: MutableOptions = { ...options }

  let ms: Numeric = milliseconds

  const isNegative = typeof ms === 'number' ? (ms as number) < 0 : (ms as bigint) < 0n
  const sign = isNegative ? '-' : ''
  if (isNegative) {
    ms = typeof ms === 'number' ? -(ms as number) : -(ms as bigint)
  }

  if (opts.colonNotation) {
    opts.compact = false
    opts.formatSubMilliseconds = false
    opts.separateMilliseconds = false
    opts.verbose = false
  }

  if (opts.compact) {
    opts.unitCount = 1
    opts.secondsDecimalDigits = 0
    opts.millisecondsDecimalDigits = 0
  }

  let result: string[] = []

  const floorDecimals = (value: number, decimalDigits: number): string => {
    const flooredInterimValue = Math.floor(value * 10 ** decimalDigits + SECOND_ROUNDING_EPSILON)
    const flooredValue = Math.round(flooredInterimValue) / 10 ** decimalDigits
    return flooredValue.toFixed(decimalDigits)
  }

  const add = (value: Numeric | number, long: string, short: string, valueString?: string) => {
    if (
      (result.length === 0 || !opts.colonNotation) &&
      isZero(value as Numeric) &&
      !(opts.colonNotation && short === 'm')
    ) {
      return
    }

    let valueStr = (valueString !== undefined ? valueString : String(value)) as string

    if (opts.colonNotation) {
      const idx = valueStr.indexOf('.')
      const wholeDigits = idx === -1 ? valueStr.length : idx
      const minLength = result.length > 0 ? 2 : 1
      valueStr = '0'.repeat(Math.max(0, minLength - wholeDigits)) + valueStr
    } else {
      valueStr += opts.verbose ? ` ${pluralize(long, value as Numeric)}` : short
    }

    result.push(valueStr)
  }

  const parsed = (parseMilliseconds as unknown as (m: Numeric) => any)(ms)
  const days = BigInt(parsed.days)

  if (opts.hideYearAndDays) {
    add(days * 24n + BigInt(parsed.hours), 'hour', 'h')
  } else {
    if (opts.hideYear) {
      add(days, 'day', 'd')
    } else {
      add(days / 365n, 'year', 'y')
      add(days % 365n, 'day', 'd')
    }

    add(Number(parsed.hours), 'hour', 'h')
  }

  add(Number(parsed.minutes), 'minute', 'm')

  if (!opts.hideSeconds) {
    if (
      opts.separateMilliseconds ||
      opts.formatSubMilliseconds ||
      (!opts.colonNotation &&
        (typeof ms === 'number' ? (ms as number) < 1000 : Number(ms) < 1000) &&
        !opts.subSecondsAsDecimals)
    ) {
      const seconds = Number(parsed.seconds)
      const millisecondsPart = Number(parsed.milliseconds)
      const microseconds = Number(parsed.microseconds)
      const nanoseconds = Number(parsed.nanoseconds)

      add(seconds, 'second', 's')

      if (opts.formatSubMilliseconds) {
        add(millisecondsPart, 'millisecond', 'ms')
        add(microseconds, 'microsecond', 'µs')
        add(nanoseconds, 'nanosecond', 'ns')
      } else {
        const millisecondsAndBelow = millisecondsPart + microseconds / 1000 + nanoseconds / 1e6

        const millisecondsDecimalDigits =
          typeof opts.millisecondsDecimalDigits === 'number' ? opts.millisecondsDecimalDigits : 0

        const roundedMilliseconds =
          millisecondsAndBelow >= 1
            ? Math.round(millisecondsAndBelow)
            : Math.ceil(millisecondsAndBelow)

        const millisecondsString = millisecondsDecimalDigits
          ? millisecondsAndBelow.toFixed(millisecondsDecimalDigits)
          : roundedMilliseconds

        add(
          Number.parseFloat(String(millisecondsString)),
          'millisecond',
          'ms',
          String(millisecondsString)
        )
      }
    } else {
      const seconds =
        ((typeof ms === 'bigint'
          ? Number((ms as bigint) % ONE_DAY_IN_MILLISECONDS)
          : (ms as number)) /
          1000) %
        60
      const secondsDecimalDigits =
        typeof opts.secondsDecimalDigits === 'number' ? opts.secondsDecimalDigits : 1
      const secondsFixed = floorDecimals(seconds, secondsDecimalDigits)
      const secondsString = opts.keepDecimalsOnWholeSeconds
        ? secondsFixed
        : secondsFixed.replace(/\.0+$/, '')
      add(Number.parseFloat(secondsString), 'second', 's', secondsString)
    }
  }

  if (result.length === 0) {
    return `${sign}0${opts.verbose ? ' milliseconds' : 'ms'}`
  }

  const separator = opts.colonNotation ? ':' : ' '
  if (typeof opts.unitCount === 'number') {
    result = result.slice(0, Math.max(opts.unitCount, 1))
  }

  return sign + result.join(separator)
}

type UnitDefinition = { milliseconds: number; names: string[] }

const unitDefinitions: UnitDefinition[] = [
  { milliseconds: 1e-6, names: ['nanoseconds', 'nanosecond', 'nsecs', 'nsec', 'ns'] },
  { milliseconds: 1, names: ['milliseconds', 'millisecond', 'msecs', 'msec', 'ms'] },
  { milliseconds: 1000, names: ['seconds', 'second', 'secs', 'sec', 's'] },
  { milliseconds: 60_000, names: ['minutes', 'minute', 'mins', 'min', 'm'] },
  { milliseconds: 3_600_000, names: ['hours', 'hour', 'hrs', 'hr', 'h'] },
  { milliseconds: 86_400_000, names: ['days', 'day', 'd'] },
  { milliseconds: 604_800_000, names: ['weeks', 'week', 'w'] }
]

const unitToMilliseconds: Record<string, number> = {}
for (const { milliseconds, names } of unitDefinitions) {
  for (const name of names) {
    unitToMilliseconds[name] = milliseconds
  }
}

const unitNames = Object.keys(unitToMilliseconds).sort((a, b) => b.length - a.length)
const unitPattern = unitNames.join('|')
const valuePattern = String.raw`[+-]?(?:\d+\.\d+|\d+|\.\d+)`

const extractionPattern = new RegExp(
  String.raw`(?<value>${valuePattern})\s*(?<unit>${unitPattern})`,
  'g'
)

/**
Parse a duration string to milliseconds.

@param input - The duration string to parse (e.g., '1h', '90m', '2 days 5 hours').
@returns The duration in milliseconds, or undefined if the input is invalid.
@throws {TypeError} If input is not a string.

Supported units:
- Nanoseconds: ns, nsec, nsecs, nanosecond, nanoseconds
- Milliseconds: ms, msec, msecs, millisecond, milliseconds
- Seconds: s, sec, secs, second, seconds
- Minutes: m, min, mins, minute, minutes
- Hours: h, hr, hrs, hour, hours
- Days: d, day, days
- Weeks: w, week, weeks
*/
function ms(input: string): number | undefined {
  if (typeof input !== 'string') {
    throw new TypeError(`Expected a string, got \`${typeof input}\``)
  }

  const normalizedInput = input.trim().toLowerCase()
  if (!normalizedInput) return undefined

  let totalMilliseconds = 0
  extractionPattern.lastIndex = 0

  let match: RegExpExecArray | null
  let prevEnd = 0
  let found = false

  while ((match = extractionPattern.exec(normalizedInput)) !== null) {
    found = true

    // Ensure there's no non-space characters between previous match and this match
    if (normalizedInput.slice(prevEnd, match.index).trim() !== '') return undefined

    const groups = (match as RegExpMatchArray & { groups?: Record<string, string | undefined> })
      .groups
    if (!groups) return undefined
    const { value, unit } = groups
    if (value === undefined || unit === undefined) return undefined

    const numericValue = Number.parseFloat(value)
    if (!Number.isFinite(numericValue)) return undefined

    const factor = unitToMilliseconds[unit]
    if (factor === undefined) return undefined

    totalMilliseconds += numericValue * factor

    prevEnd = match.index + match[0].length
  }

  if (!found) return undefined
  if (normalizedInput.slice(prevEnd).trim() !== '') return undefined

  return totalMilliseconds
}

// Wrapper that returns 0 when ms fails
function msWithFallback(input: string, fallback = 0): number {
  const parsed = ms(input)
  return parsed === undefined ? fallback : parsed
}

type PrettyBytesOptions = {
  /**
	Include plus sign for positive numbers. If the difference is exactly zero a space character will be prepended instead for better alignment.

	@default false
	*/
  readonly signed?: boolean

  /**
	- If `false`: Output won't be localized.
	- If `true`: Localize the output using the system/browser locale.
	- If `string`: Expects a [BCP 47 language tag](https://en.wikipedia.org/wiki/IETF_language_tag) (For example: `en`, `de`, ...)
	- If `string[]`: Expects a list of [BCP 47 language tags](https://en.wikipedia.org/wiki/IETF_language_tag) (For example: `en`, `de`, ...)

	@default false
	*/
  readonly locale?: boolean | string | readonly string[]

  /**
	Format the number as [bits](https://en.wikipedia.org/wiki/Bit) instead of [bytes](https://en.wikipedia.org/wiki/Byte). This can be useful when, for example, referring to [bit rate](https://en.wikipedia.org/wiki/Bit_rate).

	@default false

	@example
	```
	import prettyBytes from 'pretty-bytes';

	prettyBytes(1337, {bits: true});
	//=> '1.34 kbit'
	```
	*/
  readonly bits?: boolean

  /**
	Format the number using the [Binary Prefix](https://en.wikipedia.org/wiki/Binary_prefix) instead of the [SI Prefix](https://en.wikipedia.org/wiki/SI_prefix). This can be useful for presenting memory amounts. However, this should not be used for presenting file sizes.

	@default false

	@example
	```
	import prettyBytes from 'pretty-bytes';

	prettyBytes(1000, {binary: true});
	//=> '1000 B'

	prettyBytes(1024, {binary: true});
	//=> '1 KiB'
	```
	*/
  readonly binary?: boolean

  /**
	The minimum number of fraction digits to display.

	@default undefined

	If neither `minimumFractionDigits` nor `maximumFractionDigits` is set, the default behavior is to round to 3 significant digits.

	Note: When `minimumFractionDigits` or `maximumFractionDigits` is specified, values are truncated instead of rounded to provide more intuitive results for file sizes.

	@example
	```
	import prettyBytes from 'pretty-bytes';

	// Show the number with at least 3 fractional digits
	prettyBytes(1900, {minimumFractionDigits: 3});
	//=> '1.900 kB'

	prettyBytes(1900);
	//=> '1.9 kB'
	```
	*/
  readonly minimumFractionDigits?: number

  /**
	The maximum number of fraction digits to display.

	@default undefined

	If neither `minimumFractionDigits` nor `maximumFractionDigits` is set, the default behavior is to round to 3 significant digits.

	Note: When `minimumFractionDigits` or `maximumFractionDigits` is specified, values are truncated instead of rounded to provide more intuitive results for file sizes.

	@example
	```
	import prettyBytes from 'pretty-bytes';

	// Show the number with at most 1 fractional digit
	prettyBytes(1920, {maximumFractionDigits: 1});
	//=> '1.9 kB'

	prettyBytes(1920);
	//=> '1.92 kB'
	```
	*/
  readonly maximumFractionDigits?: number

  /**
	Put a space between the number and unit.

	@default true

	@example
	```
	import prettyBytes from 'pretty-bytes';

	prettyBytes(1920, {space: false});
	//=> '1.92kB'

	prettyBytes(1920);
	//=> '1.92 kB'
	```
	*/
  readonly space?: boolean

  /**
	Use a non-breaking space instead of a regular space to prevent the unit from wrapping to a new line.

	Has no effect when `space` is `false`.

	@default false
	*/
  readonly nonBreakingSpace?: boolean

  /**
	Pad the output to a fixed width by right-aligning it.

	Useful for creating aligned columns in tables or progress bars.

	If the output is longer than the specified width, no padding is applied.

	Must be a non-negative integer. Throws a `TypeError` for invalid values.

	@default undefined

	@example
	```
	import prettyBytes from 'pretty-bytes';

	prettyBytes(1337, {fixedWidth: 10});
	//=> '   1.34 kB'

	prettyBytes(100_000, {fixedWidth: 10});
	//=> '  100 kB'

	// Useful for progress bars and tables
	[1000, 10_000, 100_000].map(bytes => prettyBytes(bytes, {fixedWidth: 8}));
	//=> ['   1 kB', '  10 kB', ' 100 kB']
	```
	*/
  readonly fixedWidth?: number
}

const BYTE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

const BIBYTE_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

const BIT_UNITS = ['b', 'kbit', 'Mbit', 'Gbit', 'Tbit', 'Pbit', 'Ebit', 'Zbit', 'Ybit']

const BIBIT_UNITS = ['b', 'kibit', 'Mibit', 'Gibit', 'Tibit', 'Pibit', 'Eibit', 'Zibit', 'Yibit']

/*
Formats the given number using `Number#toLocaleString`.
- If locale is a string, the value is expected to be a locale-key (for example: `de`).
- If locale is true, the system default locale is used for translation.
- If no value for locale is specified, the number is returned unmodified.
*/
const formatNumber = (
  value: Numeric,
  locale: PrettyBytesOptions['locale'],
  options?: Intl.NumberFormatOptions
): string => {
  if (typeof value === 'bigint') {
    const number = Number(value)
    if (typeof locale === 'string' || Array.isArray(locale))
      return number.toLocaleString(locale, options)
    if (locale === true || options !== undefined) return number.toLocaleString(undefined, options)
    return String(value)
  }

  if (typeof locale === 'string' || Array.isArray(locale))
    return value.toLocaleString(locale, options)
  if (locale === true || options !== undefined) return value.toLocaleString(undefined, options)

  return String(value)
}

const log10 = (numberOrBigInt: Numeric): number => {
  if (typeof numberOrBigInt === 'number') {
    return Math.log10(numberOrBigInt)
  }

  const string = numberOrBigInt.toString(10)

  return string.length + Math.log10(Number(`0.${string.slice(0, 15)}`))
}

const log = (numberOrBigInt: Numeric): number => {
  if (typeof numberOrBigInt === 'number') {
    return Math.log(numberOrBigInt)
  }

  return log10(numberOrBigInt) * Math.log(10)
}

const divide = (numberOrBigInt: Numeric, divisor: number): number => {
  if (typeof numberOrBigInt === 'number') {
    return numberOrBigInt / divisor
  }

  const integerPart = numberOrBigInt / BigInt(divisor)
  const remainder = numberOrBigInt % BigInt(divisor)
  return Number(integerPart) + Number(remainder) / divisor
}

const applyFixedWidth = (result: string, fixedWidth?: number): string => {
  if (fixedWidth === undefined) {
    return result
  }

  if (typeof fixedWidth !== 'number' || !Number.isSafeInteger(fixedWidth) || fixedWidth < 0) {
    throw new TypeError(
      `Expected fixedWidth to be a non-negative integer, got ${typeof fixedWidth}: ${fixedWidth}`
    )
  }

  if (fixedWidth === 0) {
    return result
  }

  return result.length < fixedWidth ? result.padStart(fixedWidth, ' ') : result
}

const buildLocaleOptions = (
  options: PrettyBytesOptions | undefined
): Intl.NumberFormatOptions | undefined => {
  const minimumFractionDigits = options?.minimumFractionDigits
  const maximumFractionDigits = options?.maximumFractionDigits

  if (minimumFractionDigits === undefined && maximumFractionDigits === undefined) {
    return undefined
  }

  const result: Intl.NumberFormatOptions = {
    ...(minimumFractionDigits !== undefined && { minimumFractionDigits }),
    ...(maximumFractionDigits !== undefined && { maximumFractionDigits })
  }

  return result
}

/**
Convert bytes to a human readable string: `1337` → `1.34 kB`.

@param number - The number to format.
*/
function prettyBytes(number: number | bigint, options?: PrettyBytesOptions): string {
  if (typeof number !== 'bigint' && !Number.isFinite(number)) {
    throw new TypeError(`Expected a finite number, got ${typeof number}: ${number}`)
  }

  const opts: Required<Pick<PrettyBytesOptions, 'bits' | 'binary' | 'space' | 'nonBreakingSpace'>> &
    Partial<PrettyBytesOptions> = {
    bits: false,
    binary: false,
    space: true,
    nonBreakingSpace: false,
    ...options
  }

  const UNITS = opts.bits
    ? opts.binary
      ? BIBIT_UNITS
      : BIT_UNITS
    : opts.binary
      ? BIBYTE_UNITS
      : BYTE_UNITS

  const separator = opts.space ? (opts.nonBreakingSpace ? '\u00A0' : ' ') : ''

  // Work with a local variable to avoid reassigning the function parameter
  let n: Numeric = number

  // Handle signed zero case
  const isZero = typeof n === 'number' ? n === 0 : n === 0n
  if (options?.signed && isZero) {
    const result = ` 0${separator}${UNITS[0]}`
    return applyFixedWidth(result, options.fixedWidth)
  }

  const isNegative = typeof n === 'number' ? n < 0 : n < 0n
  const prefix = isNegative ? '-' : options?.signed ? '+' : ''

  if (isNegative) {
    n = typeof n === 'number' ? -n : -n
  }

  const localeOptions = buildLocaleOptions(options)
  let result: string

  // If number is less than 1 (and not a bigint > 0), show base unit
  if (typeof n === 'number' ? n < 1 : n === 0n) {
    const numberString = formatNumber(n, options?.locale, localeOptions)
    result = prefix + numberString + separator + UNITS[0]
  } else {
    const exponent = Math.min(
      Math.floor(opts.binary ? log(n) / Math.log(1024) : log10(n) / 3),
      UNITS.length - 1
    )
    const value = divide(n, (opts.binary ? 1024 : 1000) ** exponent)

    let displayValue: number = value

    if (!localeOptions) {
      const minPrecision = Math.max(3, Math.floor(displayValue).toString().length)
      displayValue = Number(displayValue.toPrecision(minPrecision))
    }

    const numberString = formatNumber(displayValue, options?.locale, localeOptions)
    const unit = UNITS[exponent]
    result = prefix + numberString + separator + unit
  }

  return applyFixedWidth(result, options?.fixedWidth)
}

/**
 * Get the current timestamp in milliseconds plus the given offset.
 *
 * @param offset - The offset to add to the current timestamp. This can be a duration string (e.g., '1h', '30m') or a number representing milliseconds.
 * @returns The current timestamp in milliseconds plus the offset.
 * @throws {TypeError} If the offset is not a finite number or a valid duration string.
 */
function msFromNow(offset: string | number): number {
  if (typeof offset === 'string') {
    const parsed = ms(offset)
    if (parsed === undefined) {
      throw new TypeError(`Invalid duration string: ${offset}`)
    }
    return Date.now() + parsed
  }

  if (typeof offset === 'number') {
    if (!Number.isFinite(offset)) {
      throw new TypeError(`Expected a finite number, got ${offset}`)
    }
    return Date.now() + offset
  }

  throw new TypeError('Expected a number or string')
}

/**
 * Convert a Unix timestamp (seconds or milliseconds) to an ISO string.
 * @param unix - Unix timestamp (number or bigint). Defaults to seconds; set options.unit='ms' for milliseconds.
 */
function unixToISO(unix: number | bigint, options?: { unit?: 's' | 'ms' }): string {
  const unit = options?.unit ?? 's'
  const ms =
    typeof unix === 'bigint'
      ? unit === 's'
        ? Number(unix) * 1000
        : Number(unix)
      : unit === 's'
        ? unix * 1000
        : unix
  return new Date(ms).toISOString()
}

/**
 * Convert an ISO date string to a Unix timestamp (seconds or milliseconds).
 * @param iso - An ISO date string (e.g., '2021-01-01T00:00:00.000Z').
 * @param options.unit - 'ms' to return milliseconds, otherwise returns seconds.
 */
function isoToUnix(iso: string, options?: { unit?: 's' | 'ms' }): number {
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) throw new TypeError(`Invalid ISO date string: ${iso}`)
  return options?.unit === 'ms' ? ms : Math.floor(ms / 1000)
}

type RelativeTimeOptions = {
  /**
   * The locale to use for formatting. Defaults to 'en'.
   */
  readonly locale?: string
  /**
   * The threshold in milliseconds to switch to date format. Defaults to 7 days.
   */
  readonly threshold?: number
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago", "yesterday", "3 days ago").
 * If the date is older than the threshold, returns a formatted date string.
 *
 * @param date - The date to format.
 * @param options - Optional configuration for locale and threshold.
 * @returns A relative time string or formatted date.
 *
 * @example
 * ```typescript
 * formatRelativeTime(new Date(Date.now() - 1000 * 60 * 5)) // "5 minutes ago"
 * formatRelativeTime(new Date(Date.now() - 1000 * 60 * 60 * 2)) // "2 hours ago"
 * formatRelativeTime(new Date(Date.now() - 1000 * 60 * 60 * 24)) // "yesterday"
 * formatRelativeTime(new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)) // "5 days ago"
 * ```
 */
function formatRelativeTime(date: Date, options?: RelativeTimeOptions): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  const threshold = options?.threshold ?? 7 * 24 * 60 * 60 * 1000 // 7 days

  // If older than threshold, return formatted date
  if (diffInMs > threshold) {
    return date.toLocaleDateString(options?.locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Use Intl.RelativeTimeFormat if available
  const locale = options?.locale ?? 'en'
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffInDays > 0) {
    return rtf.format(-diffInDays, 'day')
  }
  if (diffInHours > 0) {
    return rtf.format(-diffInHours, 'hour')
  }
  if (diffInMinutes > 0) {
    return rtf.format(-diffInMinutes, 'minute')
  }
  return rtf.format(-diffInSeconds, 'second')
}

/**
 * Format a date as a short relative time string (e.g., "2h", "1d", "5m").
 *
 * @param date - The date to format.
 * @returns A short relative time string.
 *
 * @example
 * ```typescript
 * formatShortRelativeTime(new Date(Date.now() - 1000 * 60 * 5)) // "5m"
 * formatShortRelativeTime(new Date(Date.now() - 1000 * 60 * 60 * 2)) // "2h"
 * formatShortRelativeTime(new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)) // "3d"
 * ```
 */
function formatShortRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)
  const diffInMonths = Math.floor(diffInDays / 30)
  const diffInYears = Math.floor(diffInDays / 365)

  if (diffInYears > 0) return `${diffInYears}y`
  if (diffInMonths > 0) return `${diffInMonths}mo`
  if (diffInWeeks > 0) return `${diffInWeeks}w`
  if (diffInDays > 0) return `${diffInDays}d`
  if (diffInHours > 0) return `${diffInHours}h`
  if (diffInMinutes > 0) return `${diffInMinutes}m`
  return `${diffInSeconds}s`
}

export type { TimeComponents, PrettyMsOptions, PrettyBytesOptions, RelativeTimeOptions }
export { parseMilliseconds, ms, msWithFallback, prettyMs, prettyBytes }
export { msFromNow, unixToISO, isoToUnix, formatRelativeTime, formatShortRelativeTime }
