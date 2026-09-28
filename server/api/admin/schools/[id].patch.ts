import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { schools } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, 'admin')
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const db = createDb()

  const [row] = await db
    .update(schools)
    .set({
      regionId: String(body.regionId),
      name: String(body.name).trim(),
      npsn: body.npsn || null,
      address: body.address || null,
      isActive: body.isActive !== false,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(schools.id, id), isNull(schools.deletedAt)))
    .returning()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'School not found' })
  return { data: row }
})