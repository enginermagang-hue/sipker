import { and, eq, isNull, sql } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { activities, evidence } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { writeAudit } from '#server/utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const db = createDb()

  const [row] = await db.select().from(activities).where(and(eq(activities.id, id), isNull(activities.deletedAt))).limit(1)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Activity not found' })

  if (row.createdBy !== user.id && user.roleCode !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Only the creator can submit' })
  }
  if (row.status !== 'draft' && row.status !== 'needs_revision') {
    throw createError({ statusCode: 400, statusMessage: `Cannot submit activity in status ${row.status}` })
  }
  if (!row.consultantName || !row.topic || !row.actionTaken || !row.result) {
    throw createError({ statusCode: 400, statusMessage: 'Required fields are missing' })
  }

  const [{ count }] = await db
    .select({ count: sql`count(*)` })
    .from(evidence)
    .where(and(eq(evidence.activityId, id), isNull(evidence.deletedAt), eq(evidence.status, 'available')))

  if (Number(count) === 0) {
    throw createError({ statusCode: 400, statusMessage: 'At least one evidence file is required' })
  }

  const now = new Date().toISOString()
  const [updated] = await db
    .update(activities)
    .set({ status: 'submitted', submittedAt: now, updatedAt: now, version: sql`${activities.version} + 1` })
    .where(and(eq(activities.id, id), eq(activities.version, row.version)))
    .returning()

  if (!updated) throw createError({ statusCode: 409, statusMessage: 'Concurrent modification detected' })

  await writeAudit(user, 'activity', id, 'submit', row, updated, event)
  return { data: updated }
})