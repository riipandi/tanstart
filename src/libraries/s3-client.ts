import { S3Client } from '@aws-sdk/client-s3'
import { protectedEnv } from '#/config/variables'

export const s3Client = new S3Client({
  region: protectedEnv.STORAGE_S3_REGION,
  endpoint: protectedEnv.STORAGE_S3_ENDPOINT_URL,
  forcePathStyle: protectedEnv.STORAGE_S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: protectedEnv.STORAGE_S3_ACCESS_KEY_ID,
    secretAccessKey: protectedEnv.STORAGE_S3_SECRET_ACCESS_KEY
  }
})

export function parseAssetUrl(image: string | null | undefined) {
  if (!image) return image
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  const cleanPath = image.replace(/^\//, '')

  if (!protectedEnv.PUBLIC_S3_ASSET_URL) {
    const baseUrl = protectedEnv.STORAGE_S3_ENDPOINT_URL.replace(/\/+$/, '')
    return `${baseUrl}/${protectedEnv.STORAGE_S3_BUCKET_DEFAULT}/${cleanPath}`
  }

  const baseUrl = protectedEnv.PUBLIC_S3_ASSET_URL.replace(/\/+$/, '')
  return `${baseUrl}/${cleanPath}`
}
