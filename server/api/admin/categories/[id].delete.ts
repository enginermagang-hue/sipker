import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { activityCategories } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, 'admin')
  const id = getRouterParam(event, 'id')!
  const db = createDb()

  const [row] = await db
    .update(activityCategories)
    .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(and(eq(activityCategories.id, id), isNull(activityCategories.deletedAt)))
    .returning()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  return { data: row }
})