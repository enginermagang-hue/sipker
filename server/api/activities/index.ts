import { and, asc, eq, isNull, or, like, inArray, sql } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { activities, schools, activityCategories, users, regions, evidence } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

// Fungsi untuk menentukan scope filter berdasarkan peran pengguna
// Mengembalikan undefined untuk admin/kepala (semua data),
// filter berdasarkan regionId untuk koordinator,
// dan filter berdasarkan userId + regionId untuk anggota
function scopeWhere(user: any) {
  if (user.roleCode === 'admin' || user.roleCode === 'kepala') return undefined
  if (user.roleCode === 'koordinator') return eq(activities.regionId, user.regionId!)
  // anggota: hanya data milik sendiri
  return and(eq(activities.createdBy, user.id), eq(activities.regionId, user.regionId!))
}

// Handler utama untuk endpoint GET /api/activities
// Mengambil daftar aktivitas dengan filter, join ke sekolah/kategori/pengguna,
// dan menambahkan jumlah bukti (evidence) per aktivitas
// Parameter: query string (status, regionId, schoolId, categoryId, from, to, search)
// Return: { data: array aktivitas, evidenceCount: jumlah bukti per aktivitas }
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const db = createDb()

  // Filter dasar: hanya data yang belum dihapus (soft delete)
  const conditions: any[] = [isNull(activities.deletedAt)]
  const scope = scopeWhere(user)
  if (scope) conditions.push(scope)

  // Filter opsional berdasarkan parameter query
  if (query.status) conditions.push(eq(activities.status, String(query.status)))
  if (query.regionId) conditions.push(eq(activities.regionId, String(query.regionId)))
  if (query.schoolId) conditions.push(eq(activities.schoolId, String(query.schoolId)))
  if (query.categoryId) conditions.push(eq(activities.categoryId, String(query.categoryId)))
  if (query.from) conditions.push(sql`activity_at >= ${String(query.from)}`)
  if (query.to) conditions.push(sql`activity_at <= ${String(query.to)}`)
  if (query.search) conditions.push(like(activities.consultantName, `%${query.search}%`))

  const where = conditions.length === 1 ? conditions[0] : and(...conditions)

  // Query utama: select semua field aktivitas + nama sekolah, kategori, dan pembuat
  const rows = await db
    .select({
      id: activities.id,
      createdBy: activities.createdBy,
      regionId: activities.regionId,
      schoolId: activities.schoolId,
      categoryId: activities.categoryId,
      activityAt: activities.activityAt,
      consultantName: activities.consultantName,
      consultantPosition: activities.consultantPosition,
      topic: activities.topic,
      actionTaken: activities.actionTaken,
      result: activities.result,
      followUp: activities.followUp,
      notes: activities.notes,
      status: activities.status,
      submittedAt: activities.submittedAt,
      checkedAt: activities.checkedAt,
      checkedBy: activities.checkedBy,
      reviewNote: activities.reviewNote,
      version: activities.version,
      createdAt: activities.createdAt,
      updatedAt: activities.updatedAt,
      schoolName: schools.name,
      categoryName: activityCategories.name,
      creatorName: users.name,
    })
    .from(activities)
    .innerJoin(schools, eq(activities.schoolId, schools.id))
    .innerJoin(activityCategories, eq(activities.categoryId, activityCategories.id))
    .innerJoin(users, eq(activities.createdBy, users.id))
    .where(where)
    .orderBy(asc(activities.activityAt))

  // Menambahkan jumlah bukti (evidence) untuk setiap aktivitas
  const ids = rows.map((r) => r.id)
  const evCounts = ids.length
    ? await db
        .select({ activityId: evidence.activityId, count: sql`count(*)` })
        .from(evidence)
        .where(and(inArray(evidence.activityId, ids), isNull(evidence.deletedAt), eq(evidence.status, 'available')))
        .groupBy(evidence.activityId)
    : []

  return { data: rows, evidenceCount: evCounts }
})