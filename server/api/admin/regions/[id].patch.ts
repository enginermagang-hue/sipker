import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { regions } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, 'admin')
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const db = createDb()

  const code = body.code !== undefined ? String(body.code).trim().toUpperCase() : undefined
  const name = body.name !== undefined ? String(body.name).trim() : undefined
  const description = body.description !== undefined ? (body.description ? String(body.description).trim() : null) : undefined
  const isActive = body.isActive !== undefined ? (body.isActive ? 1 : 0) : undefined

  if (code !== undefined && !code) throw createError({ statusCode: 400, statusMessage: 'Code is required' })
  if (name !== undefined && !name) throw createError({ statusCode: 400, statusMessage: 'Name is required' })

  const [row] = await db
    .update(regions)
    .set({
      ...(code !== undefined && { code }),
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(regions.id, id), isNull(regions.deletedAt)))
    .returning()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Region not found' })
  return { data: row }
})
