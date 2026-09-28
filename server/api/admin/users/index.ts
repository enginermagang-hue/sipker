import { asc, and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { users } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { hashPassword } from '#server/utils/password'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, 'admin')
  const db = createDb()
  const rows = await db
    .select({
      id: users.id,
      roleId: users.roleId,
      regionId: users.regionId,
      name: users.name,
      email: users.email,
      position: users.position,
      phone: users.phone,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(asc(users.name))
  return { data: rows }
})