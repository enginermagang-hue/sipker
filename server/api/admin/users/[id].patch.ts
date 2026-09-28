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
  const body = await readBody(event)
  const db = createDb()

  const values: any = {
    roleId: String(body.roleId),
    regionId: body.regionId ? String(body.regionId) : null,
    name: String(body.name).trim(),
    email: String(body.email).trim().toLowerCase(),
    position: body.position || null,
    phone: body.phone || null,
    isActive: body.isActive !== false,
    updatedAt: new Date().toISOString(),
  }

  if (body.password) {
    values.passwordHash = hashPassword(String(body.password))
  }

  const [row] = await db.update(users).set(values).where(and(eq(users.id, id), isNull(users.deletedAt))).returning()
  if (!row) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  const { passwordHash, ...safe } = row
  return { data: safe }
})