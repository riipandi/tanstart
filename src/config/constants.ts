const mimeTypes = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/svg+xml'
]

const fileExtensions = [
  '.doc',
  '.docx',
  '.jpeg',
  '.jpg',
  '.pdf',
  '.png',
  '.ppt',
  '.pptx',
  '.svg',
  '.txt',
  '.xls',
  '.xlsx'
]

export const RateLimits = {
  authEndpoints: {
    max: 10,
    window: 60
  }
}

export const ALLOW_LIST = { mimeTypes, fileExtensions }
