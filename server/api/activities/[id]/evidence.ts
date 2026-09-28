import { randomBytes } from 'node:crypto'
import { and, eq, isNull } from 'drizzle-orm'
import { getAccessToken } from '#server/utils/google'
import { uploadFile } from '#server/utils/drive'
import { createDb } from '#server/database/index'
import { activities, evidence } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { writeAudit } from '#server/utils/audit'

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID
const MAX_SIZE = Number(process.env.UPLOAD_MAX_SIZE || 10485760)

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!

  const db = createDb()
  const [activity] = await db.select().from(activities).where(and(eq(activities.id, id), isNull(activities.deletedAt))).limit(1)
  if (!activity) throw createError({ statusCode: 404, statusMessage: 'Activity not found' })

  // Creator, admin, or kepa can upload evidence
  if (activity.createdBy !== user.id && user.roleCode !== 'admin' && user.roleCode !== 'kepala') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readMultipartFormData(event)
  if (!body || body.length === 0) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })

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

  const [ev] = await db
    .insert(evidence)
    .values({
      id: randomBytes(16).toString('hex'),
      activityId: activity.id,
      storageProvider: 'google_drive',
      driveFileId: stored.id,
      fileName: stored.name,
      originalName: file.name,
      mimeType: stored.mimeType,
      fileSize: stored.size,
      status: 'available',
      uploadedBy: user.id,
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  await writeAudit(user, 'evidence', ev.id, 'create', null, ev, event)
  return { data: ev }
})