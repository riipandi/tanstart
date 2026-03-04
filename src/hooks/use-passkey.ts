import { useState, useCallback } from 'react'
import { authClient } from '#/guards/auth-client'

export interface PasskeyInfo {
  id: string
  name: string
  createdAt: Date
}

export function usePasskey() {
  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listUserPasskeys = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.passkey.listUserPasskeys()

      if (result.error) {
        setError(result.error.message || 'Failed to fetch passkeys')
        setIsLoading(false)
        return { error: result.error.message, data: null }
      }

      const passkeyData = (result.data ?? []).map((p) => ({
        id: p.id,
        name: p.name ?? 'Unnamed Passkey',
        createdAt: p.createdAt
      }))
      setPasskeys(passkeyData)
      setIsLoading(false)
      return { error: null, data: passkeyData }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
      setIsLoading(false)
      return { error: 'An unexpected error occurred', data: null }
    }
  }, [])

  const addPasskey = useCallback(
    async (options?: {
      name?: string
      authenticatorAttachment?: 'platform' | 'cross-platform'
    }) => {
      setIsLoading(true)
      setError(null)

      console.info('[CLIENT] Adding passkey with options:', options)

      try {
        const result = await authClient.passkey.addPasskey({
          name: options?.name,
          authenticatorAttachment: options?.authenticatorAttachment
        })

        console.info('[CLIENT] addPasskey result:', result)

        if (result.error) {
          setError(result.error.message || 'Failed to add passkey')
          setIsLoading(false)
          return { error: result.error.message, data: null }
        }

        setIsLoading(false)
        return { error: null, data: result.data }
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
        setIsLoading(false)
        return { error: 'An unexpected error occurred', data: null }
      }
    },
    []
  )

  const deletePasskey = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.passkey.deletePasskey({ id })

      if (result.error) {
        setError(result.error.message || 'Failed to delete passkey')
        setIsLoading(false)
        return { error: result.error.message, success: false }
      }

      setPasskeys((prev) => prev.filter((p) => p.id !== id))
      setIsLoading(false)
      return { error: null, success: true }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
      setIsLoading(false)
      return { error: 'An unexpected error occurred', success: false }
    }
  }, [])

  const updatePasskey = useCallback(async (id: string, name: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.passkey.updatePasskey({ id, name })

      if (result.error) {
        setError(result.error.message || 'Failed to update passkey')
        setIsLoading(false)
        return { error: result.error.message, success: false }
      }

      setPasskeys((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name: result.data?.passkey.name || name } : p))
      )
      setIsLoading(false)
      return { error: null, success: true }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
      setIsLoading(false)
      return { error: 'An unexpected error occurred', success: false }
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    passkeys,
    isLoading,
    error,
    listUserPasskeys,
    addPasskey,
    deletePasskey,
    updatePasskey,
    clearError
  }
}
