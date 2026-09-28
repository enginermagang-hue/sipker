import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { activities } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { writeAudit } from '#server/utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const db = createDb()

  const [existing] = await db.select().from(activities).where(and(eq(activities.id, id), isNull(activities.deletedAt))).limit(1)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Activity not found' })

  if (user.roleCode === 'anggota' && existing.createdBy !== user.id) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  if (user.roleCode === 'koordinator' && existing.regionId !== user.regionId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  if (existing.status === 'submitted' || existing.status === 'checked') {
    throw createError({ statusCode: 400, statusMessage: 'Cannot delete submitted or checked activity' })
  }

  const [deleted] = await db
    .update(activities)
    .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(and(eq(activities.id, id), isNull(activities.deletedAt)))
    .returning()

  if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Activity not found' })
  await writeAudit(user, 'activity', id, 'delete', existing, deleted, event)
  return { data: { id: deleted.id } }
})