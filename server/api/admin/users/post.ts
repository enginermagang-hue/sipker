import { randomBytes } from 'node:crypto'
import { createDb } from '#server/database/index'
import { users } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { hashPassword } from '#server/utils/password'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, 'admin')
  const body = await readBody(event)
  const db = createDb()

  const [row] = await db
    .insert(users)
    .values({
      id: randomBytes(16).toString('hex'),
      roleId: String(body.roleId),
      regionId: body.regionId ? String(body.regionId) : null,
      name: String(body.name).trim(),
      email: String(body.email).trim().toLowerCase(),
      passwordHash: hashPassword(String(body.password || 'password123')),
      position: body.position || null,
      phone: body.phone || null,
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning()

  return { data: { id: row.id, email: row.email, name: row.name } }
})