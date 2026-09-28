import { randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { schools } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, 'admin')
  const body = await readBody(event)
  const db = createDb()

  const [row] = await db
    .insert(schools)
    .values({
      id: randomBytes(16).toString('hex'),
      regionId: String(body.regionId),
      name: String(body.name).trim(),
      npsn: body.npsn || null,
      address: body.address || null,
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning()

  return { data: row }
})