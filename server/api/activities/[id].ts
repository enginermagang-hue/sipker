import { and, asc, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { activities, schools, activityCategories, users, regions, evidence, activityReviews } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

// Handler utama untuk endpoint GET /api/activities/:id
// Mengambil detail satu aktivitas beserta bukti (evidence) dan ulasan (reviews)
// Parameter: id dari URL router
// Return: { data: detail aktivitas, evidence: daftar bukti, reviews: daftar ulasan }
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const db = createDb()

  // Query detail aktivitas dengan join ke sekolah, kategori, pengguna, dan region
  const [row] = await db
    .select({
      id: activities.id,
      createdBy: activities.createdBy,
      regionId: activities.regionId,
      schoolId: activities.schoolId,
      categoryId: activities.categoryId,
      activityAt: activities.activityAt,
      consultantName: activities.consultantName,
      consultantPosition: activities.consultantPosition,
      consultantNip: activities.consultantNip,
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
      schoolNpsn: schools.npsn,
      categoryName: activityCategories.name,
      creatorName: users.name,
      creatorEmail: users.email,
      regionName: regions.name,
    })
    .from(activities)
    .innerJoin(schools, eq(activities.schoolId, schools.id))
    .innerJoin(activityCategories, eq(activities.categoryId, activityCategories.id))
    .innerJoin(users, eq(activities.createdBy, users.id))
    .innerJoin(regions, eq(activities.regionId, regions.id))
    .where(and(eq(activities.id, id), isNull(activities.deletedAt)))
    .limit(1)

  // Jika aktivitas tidak ditemukan, kembalikan error 404
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Activity not found' })

  // Authorization: anggota hanya bisa mengakses aktivitas miliknya sendiri
  // Koordinator hanya bisa mengakses aktivitas di region-nya
  if (user.roleCode === 'anggota' && row.createdBy !== user.id) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  if (user.roleCode === 'koordinator' && row.regionId !== user.regionId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  // Ambil semua bukti (evidence) yang terkait dengan aktivitas ini
  const ev = await db.select().from(evidence).where(and(eq(evidence.activityId, id), isNull(evidence.deletedAt)))
  // Ambil semua ulasan (reviews) yang terkait dengan aktivitas ini, diurutkan berdasarkan tanggal dibuat
  const reviews = await db.select().from(activityReviews).where(eq(activityReviews.activityId, id)).orderBy(asc(activityReviews.createdAt))

  return { data: row, evidence: ev, reviews }
})