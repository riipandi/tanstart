import { type ArgonOpts, argon2idAsync } from '@noble/hashes/argon2.js'
import { blake3 } from '@noble/hashes/blake3.js'
import { type ScryptOpts, scryptAsync } from '@noble/hashes/scrypt.js'
import { bytesToHex, randomBytes } from '@noble/hashes/utils.js'

export type Blake3OutputLength = 8 | 16 | 32 | 64

export type HashAlgorithm = 'scrypt' | 'argon2id'

export type HashProfile = 'low' | 'medium' | 'high'

export interface PasswordHashOptions {
  algo?: HashAlgorithm
  profile?: HashProfile
}

/**
 * Compute BLAKE3 hex digest with flexible output length (8 | 16 | 32 | 64 bytes).
 * Accepts string or Uint8Array. Default output length is 32 bytes.
 */
export function hashBlake3(
  input: string | Uint8Array,
  outputLength: Blake3OutputLength = 32
): string {
  const inputBytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
  if (![8, 16, 32, 64].includes(outputLength)) {
    throw new RangeError('outputLength must be one of: 8, 16, 32 or 64 (bytes)')
  }

  if (outputLength === 32) {
    const digest = blake3(inputBytes)
    return bytesToHex(digest)
  }

  const hasher = blake3.create({ dkLen: outputLength })
  hasher.update(inputBytes)
  return bytesToHex(hasher.digest())
}

/**
 * Scrypt profile configurations for different security levels.
 * - N: CPU/memory cost factor (must be power of 2). Higher = more secure, but slower.
 * - r: Block size (8 is standard). Higher = more memory usage.
 * - p: Parallelization factor (1 is standard). Higher = more CPU usage.
 * - dkLen: Output key length in bytes (32 recommended for password hashes).
 *
 * See: https://datatracker.ietf.org/doc/html/rfc7914
 */
const SCRYPT_PROFILES: Record<HashProfile, ScryptOpts> = {
  low: { N: 2 ** 14, r: 8, p: 1, dkLen: 32, maxmem: 1_048_576 * 64 },
  medium: { N: 2 ** 16, r: 8, p: 1, dkLen: 32, maxmem: 1_048_576 * 160 },
  high: { N: 2 ** 17, r: 8, p: 2, dkLen: 32, maxmem: 1_048_576 * 320 }
}

/**
 * Argon2id profile configurations for different security levels.
 * - timeCost: Number of iterations. Higher = more secure, but slower.
 * - memoryCost: Memory usage in kibibytes (KiB). Higher = more memory usage.
 * - parallelism: Degree of parallelism. Higher = more CPU cores used.
 * - hashLength: Output hash length in bytes (32 recommended).
 *
 * See: https://www.rfc-editor.org/rfc/rfc9106
 */
const ARGON2ID_PROFILES: Record<HashProfile, ArgonOpts> = {
  low: { t: 2, m: 32 * 1024, p: 1, dkLen: 32, maxmem: 32 * 1024 * 1024 },
  medium: { t: 4, m: 96 * 1024, p: 2, dkLen: 32, maxmem: 96 * 1024 * 1024 },
  high: { t: 6, m: 256 * 1024, p: 4, dkLen: 32, maxmem: 256 * 1024 * 1024 }
}

function toBytes(input: string | Uint8Array): Uint8Array {
  return typeof input === 'string' ? new TextEncoder().encode(input) : input
}

/**
 * Format hash output as: algo$l|m|h$param1value1param2value2$salt$hash
 * Profile: l=low, m=medium, h=high (single character)
 * Scrypt: N16384r8p1
 * Argon2id: t4m98304p2
 */
function formatHash(
  algo: HashAlgorithm,
  profile: HashProfile,
  params: Record<string, number>,
  salt: Uint8Array,
  hash: Uint8Array
): string {
  const saltB64 = Buffer.from(salt).toString('base64url')
  const hashB64 = Buffer.from(hash).toString('base64url')
  const profileChar: Record<HashProfile, string> = { low: 'l', medium: 'm', high: 'h' }
  const paramString = Object.entries(params)
    .map(([k, v]) => `${k}${v}`)
    .join('')
  return `${algo}$${profileChar[profile]}$${paramString}$${saltB64}$${hashB64}`
}

/**
 * Parse hash output and extract algorithm, profile, params, salt, and hash.
 * Format: algo$l|m|h$param1value1param2value2$salt$hash
 * Profile: l=low, m=medium, h=high (single character)
 * Scrypt: N16384r8p1
 * Argon2id: t4m98304p2
 */
function parseHash(hashed: string): {
  algo: HashAlgorithm | null
  profile: HashProfile | null
  params: Record<string, number>
  saltB64: string
  hashB64: string
} | null {
  const parts = hashed.split('$')
  if (parts.length !== 5) return null

  const [algo, profileChar, paramString, saltB64, hashB64] = parts

  if (algo !== 'scrypt' && algo !== 'argon2id') return null
  if (profileChar !== 'l' && profileChar !== 'm' && profileChar !== 'h') return null

  const profileMap: Record<string, HashProfile> = { l: 'low', m: 'medium', h: 'high' }

  // Parse compact params like "N16384r8p1" or "t4m98304p2"
  const params: Record<string, number> = {}
  if (paramString) {
    // Scrypt params: N, r, p
    const scryptMatch = paramString.match(/N(\d+)r(\d+)p(\d+)/)
    if (scryptMatch) {
      params.N = Number(scryptMatch[1])
      params.r = Number(scryptMatch[2])
      params.p = Number(scryptMatch[3])
    }
    // Argon2id params: t, m, p
    const argonMatch = paramString.match(/t(\d+)m(\d+)p(\d+)/)
    if (argonMatch) {
      params.t = Number(argonMatch[1])
      params.m = Number(argonMatch[2])
      params.p = Number(argonMatch[3])
    }
  }

  return {
    algo: algo as HashAlgorithm,
    profile: profileMap[profileChar]!,
    params,
    saltB64: saltB64 ?? '',
    hashB64: hashB64 ?? ''
  }
}

/**
 * Generate a password hash using the specified algorithm and profile.
 * Default: scrypt with medium profile.
 *
 * Hash format: algo$l|m|h$param1value1param2value2$salt$hash
 * - scrypt: scrypt$m$N65536r8p1$salt$hash
 * - argon2id: argon2id$m$t4m98304p2$salt$hash
 * Profile: l=low, m=medium, h=high
 *
 * @param password - Plain text password to hash
 * @param options - Hash options: algorithm (scrypt|argon2id) and profile (low|medium|high)
 * @returns Hashed password with format above
 */
export async function passwordHash(
  password: string,
  options: PasswordHashOptions = {}
): Promise<string> {
  const { algo = 'scrypt', profile = 'medium' } = options
  const salt = randomBytes(16)
  const passwordBytes = toBytes(password)

  if (algo === 'scrypt') {
    const opts = SCRYPT_PROFILES[profile]
    const hash = await scryptAsync(passwordBytes, salt, opts)
    return formatHash(algo, profile, { N: opts.N!, r: opts.r!, p: opts.p! }, salt, hash)
  }

  if (algo === 'argon2id') {
    const opts = ARGON2ID_PROFILES[profile]
    const hash = await argon2idAsync(passwordBytes, salt, opts)
    return formatHash(algo, profile, { t: opts.t!, m: opts.m!, p: opts.p! }, salt, hash)
  }

  throw new Error(`Unsupported algorithm: ${algo}`)
}

/**
 * Validate a password against a hash.
 * Automatically detects algorithm and profile from the hash string.
 *
 * @param password - Plain text password to verify
 * @param hashed - Hashed password string from passwordHash()
 * @returns true if password matches, false otherwise
 */
export async function passwordVerify(password: string, hashed: string): Promise<boolean> {
  const parsed = parseHash(hashed)
  if (!parsed) return false

  const { algo, params, saltB64, hashB64 } = parsed
  const salt = Buffer.from(saltB64, 'base64url')
  const hash = Buffer.from(hashB64, 'base64url')
  const passwordBytes = toBytes(password)

  if (algo === 'scrypt') {
    const scryptOpts: ScryptOpts = {
      N: params.N || 2 ** 15,
      r: params.r || 8,
      p: params.p || 1,
      dkLen: hash.length
    }
    const derived = await scryptAsync(passwordBytes, salt, scryptOpts)
    return Buffer.from(derived).equals(hash)
  }

  if (algo === 'argon2id') {
    const argonOpts: ArgonOpts = {
      t: params.t || 3,
      m: params.m || 65536,
      p: params.p || 1,
      dkLen: hash.length
    }
    const derived = await argon2idAsync(passwordBytes, salt, argonOpts)
    return Buffer.from(derived).equals(hash)
  }

  return false
}
