import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { users } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { hashPassword } from '#server/utils/password'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, 'admin')
  const id = getRouterParam(event, 'id')!
  const db = createDb()
  const [row] = await db.select().from(users).where(and(eq(users.id, id), isNull(users.deletedAt))).limit(1)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  const { passwordHash, ...safe } = row
  return { data: safe }
})