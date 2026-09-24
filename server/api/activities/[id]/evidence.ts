import { getAccessToken } from '#server/utils/google'
import { uploadFile } from '#server/utils/drive'

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID
const MAX_SIZE = Number(process.env.UPLOAD_MAX_SIZE || 10485760)

function getEvent(event: any) {
  return event as any
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing activity id' })
  }

  const body = await readMultipartFormData(event)
  if (!body || body.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const filePart = body[0]
  if (!filePart || !filePart.data || filePart.data.byteLength === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Empty file' })
  }

  if (filePart.data.byteLength > MAX_SIZE) {
    throw createError({ statusCode: 413, statusMessage: 'File too large' })
  }

  const file = new File([filePart.data], filePart.filename || 'upload', { type: filePart.type || 'application/octet-stream' })
  const stored = await uploadFile(file, file.name)
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    activityId: id,
    storageProvider: 'google_drive',
    driveFileId: stored.id,
    fileName: stored.name,
    originalName: file.name,
    mimeType: stored.mimeType,
    fileSize: stored.size,
    status: 'uploading',
    uploadedAt: now,
    createdAt: now,
    updatedAt: now,
  }
})
