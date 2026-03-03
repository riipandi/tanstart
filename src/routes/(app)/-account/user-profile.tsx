import { useRouter } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { useRef, useState, Activity } from 'react'
import { z } from 'zod'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/avatar'
import { Session } from '#/guards/auth-client'
import { authClient } from '#/guards/auth-client'
import { removeAvatar, uploadAvatar } from '#/guards/avatar'
import { useAppForm } from '#/hooks/use-form'
import { clx } from '#/utils/variant'

const nameSchema = z.object({
  firstName: z.string().min(1, { error: 'First name is required' }),
  lastName: z.string().min(1, { error: 'Last name is required' })
})

export function UserProfile(user: Session['user']) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [isEditingName, setIsEditingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  const nameParts = user.name?.split(' ') || ['', '']
  const initialFirstName = nameParts[0] || ''
  const initialLastName = nameParts.slice(1).join(' ') || ''

  const nameForm = useAppForm({
    defaultValues: { firstName: initialFirstName, lastName: initialLastName },
    validators: { onChangeAsync: nameSchema },
    onSubmit: async ({ value, formApi }) => {
      setNameError(null)

      try {
        const fullName = `${value.firstName.trim()} ${value.lastName.trim()}`
        const result = await authClient.updateUser({ name: fullName })

        if (result.error) {
          setNameError(result.error.message || 'Failed to update name')
          return
        }

        setIsEditingName(false)
        formApi.reset()
        router.invalidate()
      } catch (err) {
        console.error(err)
        setNameError('An unexpected error occurred')
      }
    }
  })

  const handleStartEdit = () => {
    setIsEditingName(true)
    setNameError(null)
    const nameParts = user.name?.split(' ') || ['', '']
    nameForm.reset({ firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '' })
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
    setNameError(null)
    const nameParts = user.name?.split(' ') || ['', '']
    nameForm.reset({ firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '' })
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
    setUploadProgress(0)
    setError(null)

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    try {
      const base64 = await fileToBase64(file)

      const result = await uploadAvatar({
        data: {
          filename: file.name,
          contentType: file.type,
          base64: base64
        }
      })

      setUploadProgress(100)

      const updateResult = await authClient.updateUser({ image: result.path })

      if (updateResult.error) {
        throw new Error(updateResult.error.message)
      }

      router.invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
      console.error(err)
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
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
            <Avatar
              className={clx(
                'absolute inset-0 flex size-full items-center justify-center rounded-full',
                isUploading && 'opacity-30'
              )}
            >
              <AvatarImage src={user.image || '/images/default-avatar.png'} alt={user.name} />
              <AvatarFallback asInitial>{user.name}</AvatarFallback>
            </Avatar>

            <div className='absolute inset-0 flex size-full items-center justify-center rounded-full transition-opacity duration-200'>
              {isUploading ? (
                <div className='relative flex size-full items-center justify-center'>
                  <svg className='absolute size-full -rotate-90' viewBox='0 0 36 36'>
                    <path
                      className='stroke-black/10'
                      strokeWidth={3}
                      fill='none'
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    />
                    <path
                      className='stroke-background-primary transition-all duration-300 ease-out'
                      strokeWidth={3}
                      strokeLinecap='round'
                      strokeDasharray={`${uploadProgress}, 100`}
                      fill='none'
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    />
                  </svg>
                  <span className='text-foreground-neutral text-xs font-semibold'>
                    {uploadProgress}%
                  </span>
                </div>
              ) : (
                <div className='flex size-full items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                  <Lucide.Camera className='text-white' size={20} />
                </div>
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
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                nameForm.handleSubmit()
              }}
              className='space-y-2'
            >
              <div className='grid grid-cols-2 gap-3'>
                <nameForm.AppField
                  name='firstName'
                  validators={{
                    onBlur: ({ value }) => {
                      if (!value || value.trim().length === 0) {
                        return 'First name is required'
                      }
                      return undefined
                    }
                  }}
                >
                  {(field) => <field.TextField label='First Name' placeholder='First Name' />}
                </nameForm.AppField>

                <nameForm.AppField
                  name='lastName'
                  validators={{
                    onBlur: ({ value }) => {
                      if (!value || value.trim().length === 0) {
                        return 'Last name is required'
                      }
                      return undefined
                    }
                  }}
                >
                  {(field) => <field.TextField label='Last Name' placeholder='Last Name' />}
                </nameForm.AppField>
              </div>
              <div className='flex items-center gap-1'>
                <nameForm.AppForm>
                  <nameForm.SubmitButton label='Save' />
                </nameForm.AppForm>
                <button
                  type='button'
                  onClick={handleCancelEdit}
                  className='text-on-background-neutral hover:text-foreground-neutral rounded px-3 py-1 text-xs font-medium transition-colors'
                >
                  Cancel
                </button>
              </div>
              {nameError && <p className='text-foreground-critical text-xs'>{nameError}</p>}
            </form>
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
