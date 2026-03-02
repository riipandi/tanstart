import clipboardy from 'clipboardy'
import { useState, useCallback } from 'react'
import { renderSVG } from 'uqr'
import { authClient } from '#/guards/auth-client'

export function useQRCode() {
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null)

  const generateQRCode = useCallback((data: string) => {
    try {
      const svg = renderSVG(data, {
        pixelSize: 8,
        ecc: 'M',
        whiteColor: '#ffffff',
        blackColor: '#000000',
        border: 1
      })
      setQrCodeSvg(svg)
    } catch (err) {
      console.error('Failed to generate QR code:', err)
      setQrCodeSvg(null)
    }
  }, [])

  const clearQRCode = useCallback(() => {
    setQrCodeSvg(null)
  }, [])

  return { qrCodeSvg, generateQRCode, clearQRCode }
}

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = useCallback(async (text: string) => {
    if (!text) return false

    try {
      await clipboardy.write(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return true
    } catch (err) {
      console.error('Failed to copy:', err)
      return false
    }
  }, [])

  return { copied, copyToClipboard }
}

export function useTwoFactorSetup() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storedBackupCodes, setStoredBackupCodes] = useState<string[] | null>(null)

  const enableTwoFactor = useCallback(async (password: string) => {
    setError(null)
    setIsVerifying(true)

    try {
      const result = await authClient.twoFactor.enable({ password })

      if (result.error) {
        setError(result.error.message || 'Failed to enable 2FA')
        setIsVerifying(false)
        return { error: result.error.message, data: null }
      }

      if (result.data?.backupCodes) {
        setStoredBackupCodes(result.data.backupCodes)
      }

      setIsVerifying(false)
      return { error: null, data: result.data }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
      setIsVerifying(false)
      return { error: 'An unexpected error occurred', data: null }
    }
  }, [])

  const verifyTotp = useCallback(
    async (code: string) => {
      setError(null)
      setIsVerifying(true)

      try {
        const result = await authClient.twoFactor.verifyTotp({ code })

        if (result.error) {
          setError(result.error.message || 'Invalid verification code')
          setIsVerifying(false)
          return { error: result.error.message, success: false }
        }

        setIsVerifying(false)
        return { error: null, success: true, backupCodes: storedBackupCodes }
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
        setIsVerifying(false)
        return { error: 'An unexpected error occurred', success: false }
      }
    },
    [storedBackupCodes]
  )

  const verifyOtp = useCallback(
    async (code: string) => {
      setError(null)
      setIsVerifying(true)

      try {
        const result = await authClient.twoFactor.verifyOtp({ code })

        if (result.error) {
          setError(result.error.message || 'Invalid verification code')
          setIsVerifying(false)
          return { error: result.error.message, success: false }
        }

        setIsVerifying(false)
        return { error: null, success: true, backupCodes: storedBackupCodes }
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
        setIsVerifying(false)
        return { error: 'An unexpected error occurred', success: false }
      }
    },
    [storedBackupCodes]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const sendOtp = useCallback(async () => {
    const sendResult = await authClient.twoFactor.sendOtp()
    if (sendResult.error) {
      const errorMessage = sendResult.error.message || 'Failed to send OTP'
      setError(errorMessage)
      return { error: errorMessage, success: false }
    }
    clearError()
    return { error: null, success: true }
  }, [clearError])

  const disableTwoFactor = useCallback(async (password: string) => {
    setError(null)
    setIsVerifying(true)

    try {
      const result = await authClient.twoFactor.disable({ password })

      if (result.error) {
        setError(result.error.message || 'Failed to disable 2FA')
        setIsVerifying(false)
        return { error: result.error.message, success: false }
      }

      setIsVerifying(false)
      return { error: null, success: true }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
      setIsVerifying(false)
      return { error: 'An unexpected error occurred', success: false }
    }
  }, [])

  const generateBackupCodes = useCallback(async (password: string) => {
    setError(null)
    setIsVerifying(true)

    try {
      const result = await authClient.twoFactor.generateBackupCodes({ password })

      if (result.error) {
        setError(result.error.message || 'Failed to generate backup codes')
        setIsVerifying(false)
        return { error: result.error.message, data: null }
      }

      setIsVerifying(false)
      return { error: null, data: result.data }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred')
      setIsVerifying(false)
      return { error: 'An unexpected error occurred', data: null }
    }
  }, [])

  const clearStoredBackupCodes = useCallback(() => {
    setStoredBackupCodes(null)
  }, [])

  return {
    isVerifying,
    error,
    storedBackupCodes,
    enableTwoFactor,
    verifyTotp,
    verifyOtp,
    sendOtp,
    disableTwoFactor,
    generateBackupCodes,
    clearError,
    clearStoredBackupCodes
  }
}

export function extractSecretFromUri(uri: string): string | null {
  try {
    const url = new URL(uri)
    return url.searchParams.get('secret')
  } catch {
    return null
  }
}
