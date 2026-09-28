import { and, eq, isNull, sql } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { activities, evidence } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { writeAudit } from '#server/utils/audit'

// Handler utama untuk endpoint POST /api/activities/:id/submit
// Mengubah status aktivitas dari 'draft' atau 'needs_revision' menjadi 'submitted'
// Memerlukan minimal satu bukti (evidence) yang tersedia
// Parameter: id dari URL router
// Return: { data: aktivitas yang telah disubmit }
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const db = createDb()

  // Cari aktivitas yang ada dan belum dihapus
  const [row] = await db.select().from(activities).where(and(eq(activities.id, id), isNull(activities.deletedAt))).limit(1)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Activity not found' })

  // Hanya pembuat aktivitas atau admin yang bisa mengirimkan
  if (row.createdBy !== user.id && user.roleCode !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Only the creator can submit' })
  }

  // Hanya bisa mengirimkan jika status masih draft atau needs_revision
  if (row.status !== 'draft' && row.status !== 'needs_revision') {
    throw createError({ statusCode: 400, statusMessage: `Cannot submit activity in status ${row.status}` })
  }

  // Validasi field wajib: consultantName, topic, actionTaken, result
  if (!row.consultantName || !row.topic || !row.actionTaken || !row.result) {
    throw createError({ statusCode: 400, statusMessage: 'Required fields are missing' })
  }

  // Pastikan ada minimal satu bukti (evidence) yang tersedia untuk aktivitas ini
  const [{ count }] = await db
    .select({ count: sql`count(*)` })
    .from(evidence)
    .where(and(eq(evidence.activityId, id), isNull(evidence.deletedAt), eq(evidence.status, 'available')))

  if (Number(count) === 0) {
    throw createError({ statusCode: 400, statusMessage: 'At least one evidence file is required' })
  }

  const now = new Date().toISOString()
  // Update status menjadi 'submitted' dan set submittedAt, dengan optimistic locking
  const [updated] = await db
    .update(activities)
    .set({ status: 'submitted', submittedAt: now, updatedAt: now, version: sql`${activities.version} + 1` })
    .where(and(eq(activities.id, id), eq(activities.version, row.version)))
    .returning()

  // Jika tidak ada baris yang diperbarui, berarti terjadi concurrent modification
  if (!updated) throw createError({ statusCode: 409, statusMessage: 'Concurrent modification detected' })

  // Catat audit trail untuk pengiriman aktivitas
  await writeAudit(user, 'activity', id, 'submit', row, updated, event)
  return { data: updated }
})