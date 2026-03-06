import { protectedEnv, publicEnv } from './variables'

export type PublicEnv = typeof publicEnv
export type ProtectedEnv = typeof protectedEnv

export * from './constants'
export { publicEnv, protectedEnv }
