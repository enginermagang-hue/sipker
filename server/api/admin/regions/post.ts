import { randomBytes } from 'node:crypto'
import { createDb } from '#server/database/index'
import { regions } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, 'admin')
  const body = await readBody(event)
  const db = createDb()

  const [row] = await db
    .insert(regions)
    .values({
      id: randomBytes(16).toString('hex'),
      code: String(body.code).trim().toUpperCase(),
      name: String(body.name).trim(),
      description: body.description || null,
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning()

  return { data: row }
})