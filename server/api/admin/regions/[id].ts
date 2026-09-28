import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { regions } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, 'admin')
  const id = getRouterParam(event, 'id')!
  const db = createDb()
  const [row] = await db.select().from(regions).where(and(eq(regions.id, id), isNull(regions.deletedAt))).limit(1)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Region not found' })
  return { data: row }
})