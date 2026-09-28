import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { activities } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { writeAudit } from '#server/utils/audit'

// Handler utama untuk endpoint DELETE /api/activities/:id
// Menghapus aktivitas secara lunak (soft delete) dengan mengatur deletedAt
// Hanya bisa dihapus jika status bukan 'submitted' atau 'checked'
// Parameter: id dari URL router
// Return: { data: { id: id aktivitas yang dihapus } }
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const db = createDb()

  // Cari aktivitas yang ada dan belum dihapus
  const [existing] = await db.select().from(activities).where(and(eq(activities.id, id), isNull(activities.deletedAt))).limit(1)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Activity not found' })

  // Authorization: anggota hanya bisa menghapus aktivitas miliknya sendiri
  // Koordinator hanya bisa menghapus aktivitas di region-nya
  if (user.roleCode === 'anggota' && existing.createdBy !== user.id) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  if (user.roleCode === 'koordinator' && existing.regionId !== user.regionId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  // Tidak bisa menghapus aktivitas yang sudah disubmit atau sudah diperiksa
  if (existing.status === 'submitted' || existing.status === 'checked') {
    throw createError({ statusCode: 400, statusMessage: 'Cannot delete submitted or checked activity' })
  }

  // Soft delete: mengatur deletedAt dan updatedAt tanpa menghapus baris secara permanen
  const [deleted] = await db
    .update(activities)
    .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(and(eq(activities.id, id), isNull(activities.deletedAt)))
    .returning()

  if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Activity not found' })

  // Catat audit trail untuk penghapusan aktivitas
  await writeAudit(user, 'activity', id, 'delete', existing, deleted, event)
  return { data: { id: deleted.id } }
})