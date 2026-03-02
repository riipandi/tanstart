import { useRouter } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { useRef, useState, useEffect, Activity } from 'react'
import { Session } from '#/guards/auth-client'
import { authClient } from '#/guards/auth-client'
import { removeAvatar, uploadAvatar } from '#/guards/avatar'
import { clx } from '#/utils/variant'

export function UserProfile(user: Session['user']) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Editable name states
  const [isEditingName, setIsEditingName] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  // Parse name into first and last name on mount or when user changes
  useEffect(() => {
    const nameParts = user.name?.split(' ') || ['', '']
    setFirstName(nameParts[0] || '')
    setLastName(nameParts.slice(1).join(' ') || '')
  }, [user.name])

  const handleStartEdit = () => {
    setIsEditingName(true)
    setNameError(null)
  }

  const handleCancelEdit = () => {
    const nameParts = user.name?.split(' ') || ['', '']
    setFirstName(nameParts[0] || '')
    setLastName(nameParts.slice(1).join(' ') || '')
    setIsEditingName(false)
    setNameError(null)
  }

  const handleSaveName = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setNameError('First name and last name are required')
      return
    }

    setIsSavingName(true)
    setNameError(null)

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`
      const result = await authClient.updateUser({ name: fullName })

      if (result.error) {
        throw new Error(result.error.message)
      }

      setIsEditingName(false)
      router.invalidate()
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Failed to update name')
      console.error(err)
    } finally {
      setIsSavingName(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const base64 = await fileToBase64(file)

      const result = await uploadAvatar({
        data: {
          filename: file.name,
          contentType: file.type,
          base64: base64
        }
      })

      const updateResult = await authClient.updateUser({ image: result.path })

      if (updateResult.error) {
        throw new Error(updateResult.error.message)
      }

      router.invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user.image) return

    setIsRemoving(true)
    setError(null)

    try {
      await removeAvatar({ data: { image: user.image } })
      const updateResult = await authClient.updateUser({ image: null })

      if (updateResult.error) {
        throw new Error(updateResult.error.message)
      }

      router.invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar')
      console.error(err)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className='border-border-neutral rounded-lg border p-6'>
      <div className='flex items-start justify-start gap-6'>
        <div className='flex flex-col items-center gap-2'>
          <button
            type='button'
            className='group border-border-neutral relative size-14 cursor-pointer rounded-full border bg-white p-2'
            onClick={handleAvatarClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleAvatarClick()
              }
            }}
            disabled={isUploading}
          >
            <img
              src={user.imageURL || '/images/default-avatar.png'}
              className={clx(
                'absolute inset-0 flex size-full items-center justify-center rounded-full bg-white',
                isUploading && 'opacity-50'
              )}
              alt={user.name}
            />

            <div className='absolute inset-0 flex size-full items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
              {isUploading ? (
                <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
              ) : (
                <Lucide.Camera className='text-white' size={20} />
              )}
            </div>

            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className='hidden'
              disabled={isUploading}
            />
          </button>

          {user.image && (
            <button
              type='button'
              onClick={handleRemoveAvatar}
              className='text-foreground-critical cursor-pointer text-xs font-semibold transition-colors hover:underline disabled:opacity-50'
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
          )}
        </div>

        <div className='flex-1 space-y-1.5'>
          <Activity mode={isEditingName ? 'visible' : 'hidden'}>
            <div className='space-y-2'>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='text-on-background-neutral mb-1 block text-xs font-medium'>
                    First Name
                  </label>
                  <input
                    type='text'
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className='border-border-neutral focus:border-foreground-neutral w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                    placeholder='First Name'
                    disabled={isSavingName}
                  />
                </div>
                <div>
                  <label className='text-on-background-neutral mb-1 block text-xs font-medium'>
                    Last Name
                  </label>
                  <input
                    type='text'
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className='border-border-neutral focus:border-foreground-neutral w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                    placeholder='Last Name'
                    disabled={isSavingName}
                  />
                </div>
              </div>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className='bg-background-primary text-on-background-primary hover:bg-background-primary/80 rounded px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50'
                >
                  {isSavingName ? 'Saving...' : 'Save'}
                </button>
                <button
                  type='button'
                  onClick={handleCancelEdit}
                  disabled={isSavingName}
                  className='text-on-background-neutral hover:text-foreground-neutral rounded px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50'
                >
                  Cancel
                </button>
              </div>
              {nameError && <p className='text-foreground-critical text-xs'>{nameError}</p>}
            </div>
          </Activity>

          <Activity mode={!isEditingName ? 'visible' : 'hidden'}>
            <div>
              <div className='group flex items-center gap-2'>
                <span className='text-on-background-neutral hover:text-foreground-neutral text-left font-medium transition-colors'>
                  {user.name}
                </span>
                <button
                  type='button'
                  onClick={handleStartEdit}
                  className='text-on-background-neutral hover:text-foreground-neutral mb-0.5 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100'
                  title='Edit name'
                >
                  <Lucide.Pencil size={14} />
                </button>
              </div>
              <p className='text-sm font-medium'>{user.email}</p>
            </div>
          </Activity>

          <div>
            <p className='text-xs font-medium'>
              Member since {user.createdAt.toLocaleDateString()}
            </p>
          </div>
          {error && <p className='text-foreground-critical mt-1 text-xs'>{error}</p>}
        </div>
      </div>
    </div>
  )
}
