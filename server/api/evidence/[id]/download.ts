import { and, eq, isNull } from 'drizzle-orm'
import { getAccessToken } from '#server/utils/google'
import { downloadFile } from '#server/utils/drive'
import { createDb } from '#server/database/index'
import { evidence, activities } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { writeAudit } from '#server/utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const db = createDb()

  const [ev] = await db.select().from(evidence).where(and(eq(evidence.id, id), isNull(evidence.deletedAt))).limit(1)
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Evidence not found' })

  const [activity] = await db.select().from(activities).where(eq(activities.id, ev.activityId)).limit(1)
  if (!activity) throw createError({ statusCode: 404, statusMessage: 'Activity not found' })

  // Region/ownership check
  if (user.roleCode === 'anggota' && activity.createdBy !== user.id) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  if (user.roleCode === 'koordinator' && activity.regionId !== user.regionId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const blob = await downloadFile(ev.driveFileId)
  await writeAudit(user, 'evidence', ev.id, 'download', null, { driveFileId: ev.driveFileId }, event)

  setHeader(event, 'Content-Type', ev.mimeType || 'application/octet-stream')
  setHeader(event, 'Content-Length', String(blob.size))
  setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(ev.fileName || 'download')}"`)
  return blob
})