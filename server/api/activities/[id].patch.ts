import { and, eq, isNull, sql } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { activities, schools } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { writeAudit } from '#server/utils/audit'

// Handler utama untuk endpoint PATCH /api/activities/:id
// Memperbarui data aktivitas yang sudah ada (hanya jika status draft atau needs_revision)
// Menggunakan optimistic locking berdasarkan version untuk mencegah perubahan bersamaan
// Parameter: id dari URL router, body berisi field yang akan diperbarui
// Return: { data: aktivitas yang telah diperbarui }
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const db = createDb()

  // Cari aktivitas yang ada dan belum dihapus
  const [existing] = await db.select().from(activities).where(and(eq(activities.id, id), isNull(activities.deletedAt))).limit(1)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Activity not found' })

  // Authorization: anggota hanya bisa mengedit aktivitas miliknya sendiri
  // Koordinator hanya bisa mengedit aktivitas di region-nya
  if (user.roleCode === 'anggota' && existing.createdBy !== user.id) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  if (user.roleCode === 'koordinator' && existing.regionId !== user.regionId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  // Hanya bisa mengedit jika status masih draft atau needs_revision
  if (existing.status !== 'draft' && existing.status !== 'needs_revision') {
    throw createError({ statusCode: 400, statusMessage: 'Cannot edit activity in current status' })
  }

  // Validasi sekolah jika sekolah diubah
  let schoolId = existing.schoolId
  if (body.schoolId && body.schoolId !== existing.schoolId) {
    const [school] = await db.select().from(schools).where(and(eq(schools.id, String(body.schoolId)), eq(schools.regionId, existing.regionId))).limit(1)
    if (!school) throw createError({ statusCode: 400, statusMessage: 'School not found in region' })
    schoolId = school.id
  }

  // Update data aktivitas dengan optimistic locking (version check)
  // Hanya memperbarui field yang ada di body, mempertahankan nilai lama jika tidak ada
  const [updated] = await db
    .update(activities)
    .set({
      schoolId,
      categoryId: body.categoryId ? String(body.categoryId) : existing.categoryId,
      activityAt: body.activityAt ? String(body.activityAt) : existing.activityAt,
      consultantName: body.consultantName ? String(body.consultantName).trim() : existing.consultantName,
      consultantPosition: body.consultantPosition ?? existing.consultantPosition,
      consultantNip: body.consultantNip ?? existing.consultantNip,
      topic: body.topic ? String(body.topic).trim() : existing.topic,
      actionTaken: body.actionTaken ? String(body.actionTaken).trim() : existing.actionTaken,
      result: body.result ? String(body.result).trim() : existing.result,
      followUp: body.followUp ?? existing.followUp,
      notes: body.notes ?? existing.notes,
      updatedAt: new Date().toISOString(),
      version: sql`${activities.version} + 1`, // Increment version untuk optimistic locking
    })
    .where(and(eq(activities.id, id), eq(activities.version, existing.version)))
    .returning()

  // Jika tidak ada baris yang diperbarui, berarti terjadi concurrent modification
  if (!updated) throw createError({ statusCode: 409, statusMessage: 'Concurrent modification detected' })

  // Catat audit trail untuk pembaruan aktivitas
  await writeAudit(user, 'activity', id, 'update', existing, updated, event)
  return { data: updated }
})