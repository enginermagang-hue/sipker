import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { activityCategories } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, 'admin')
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const db = createDb()

  const [row] = await db
    .update(activityCategories)
    .set({
      code: String(body.code).trim().toLowerCase(),
      name: String(body.name).trim(),
      description: body.description ?? undefined,
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive !== false,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(activityCategories.id, id), isNull(activityCategories.deletedAt)))
    .returning()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  return { data: row }
})