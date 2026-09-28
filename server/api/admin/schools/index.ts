import { asc, and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { schools, regions } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, 'admin')
  const db = createDb()
  const rows = await db
    .select()
    .from(schools)
    .where(isNull(schools.deletedAt))
    .asc(schools.name)
  return { data: rows }
})