import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { protectedEnv } from '#/config/variables'
import { ensureSession } from '#/guards/session'
import { s3Client } from '#/libraries/s3-client'

function generateAvatarKey(userId: string, filename: string): string {
  const ext = filename.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `avatars/${userId}/${timestamp}-${random}.${ext}`
}

export const uploadAvatar = createServerFn({ method: 'POST' })
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

    const baseUrl = protectedEnv.PUBLIC_S3_ASSET_URL.replace(/\/+$/, '')
    const bucket = protectedEnv.STORAGE_S3_BUCKET_DEFAULT
    const publicUrl = `${baseUrl}/${bucket}/${key}`

    return { path: key, url: publicUrl }
  })

export const removeAvatar = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ image: z.string().optional() }))
  .handler(async ({ data }) => {
    if (data.image && data.image.startsWith('avatars/')) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: protectedEnv.STORAGE_S3_BUCKET_DEFAULT,
          Key: data.image
        })
      )
    }

    return { success: true }
  })
