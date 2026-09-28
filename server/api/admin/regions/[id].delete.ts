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

  const [row] = await db
    .update(regions)
    .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(and(eq(regions.id, id), isNull(regions.deletedAt)))
    .returning()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Region not found' })
  return { data: row }
})