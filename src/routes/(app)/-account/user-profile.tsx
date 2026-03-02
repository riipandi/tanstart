import { Upload } from '@aws-sdk/lib-storage'
import { useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Camera } from 'lucide-react'
import { useRef, useState } from 'react'
import { z } from 'zod'
import { protectedEnv } from '#/config/variables'
import { Session } from '#/guards/auth-client'
import { authClient } from '#/guards/auth-client'
import { ensureSession } from '#/guards/session'
import { s3Client } from '#/libraries/s3-client'
import { clx } from '#/utils/variant'

function generateAvatarKey(userId: string, filename: string): string {
  const ext = filename.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `avatars/${userId}/${timestamp}-${random}.${ext}`
}

const uploadAvatar = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      filename: z.string(),
      contentType: z.string(),
      base64: z.string()
    })
  )
  .handler(async ({ data }) => {
    const { user } = await ensureSession()
    const key = generateAvatarKey(user.id, data.filename)
    const base64Data = data.base64.split(',')[1] || data.base64
    const buffer = Buffer.from(base64Data, 'base64')
    const blob = new Blob([buffer], { type: data.contentType })
    const file = new File([blob], data.filename, { type: data.contentType })

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: protectedEnv.STORAGE_S3_BUCKET_DEFAULT,
        Key: key,
        Body: file,
        ContentType: data.contentType,
        ACL: 'public-read'
      }
    })

    upload.on('httpUploadProgress', (progress) => {
      console.log(`Upload progress: ${progress.loaded}/${progress.total}`)
    })

    await upload.done()

    const baseUrl = protectedEnv.STORAGE_S3_PUBLIC_URL.replace(/\/+$/, '')
    const bucket = protectedEnv.STORAGE_S3_BUCKET_DEFAULT
    const publicUrl = `${baseUrl}/${bucket}/${key}`

    return { path: key, url: publicUrl }
  })

interface UserProfileProps {
  user: Session['user']
}

export function UserProfile({ user }: UserProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      const updateResult = await authClient.updateUser({
        image: result.path
      })

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

  return (
    <div className='border-border-neutral rounded-lg border p-6'>
      <div className='flex items-center justify-start gap-4'>
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
            src={user.image || '/images/default-avatar.png'}
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
              <Camera className='text-white' size={20} />
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

        <div className='space-y-1.5'>
          <div>
            <p className='text-on-background-neutral font-medium'>{user.name}</p>
            <p className='text-sm font-medium'>{user.email}</p>
          </div>
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
