import { authClient } from '#/guards/auth-client'

export interface PasskeyInfo {
  id: string
  name: string
  createdAt: Date
}

export async function listUserPasskeys() {
  const result = await authClient.passkey.listUserPasskeys()

  if (result.error) {
    return { error: result.error.message, data: null }
  }

  const passkeyData = (result.data ?? []).map((p) => ({
    id: p.id,
    name: p.name ?? 'Unnamed Passkey',
    createdAt: p.createdAt
  }))

  return { error: null, data: passkeyData }
}

export async function addPasskey(options?: {
  name?: string
  authenticatorAttachment?: 'platform' | 'cross-platform'
}) {
  console.info('[CLIENT] Adding passkey with options:', options)

  const result = await authClient.passkey.addPasskey({
    name: options?.name,
    authenticatorAttachment: options?.authenticatorAttachment
  })

  console.info('[CLIENT] addPasskey result:', result)

  if (result.error) {
    return { error: result.error.message, data: null }
  }

  return { error: null, data: result.data }
}

export async function deletePasskey(id: string) {
  const result = await authClient.passkey.deletePasskey({ id })

  if (result.error) {
    return { error: result.error.message, success: false }
  }

  return { error: null, success: true }
}

export async function updatePasskey(id: string, name: string) {
  const result = await authClient.passkey.updatePasskey({ id, name })

  if (result.error) {
    return { error: result.error.message, success: false }
  }

  return { error: null, success: true }
}
