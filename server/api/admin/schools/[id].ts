import { eq } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { schools } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, 'admin')
  const id = getRouterParam(event, 'id')!
  const db = createDb()
  const [row] = await db.select().from(schools).where(eq(schools.id, id)).limit(1)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'School not found' })
  return { data: row }
})