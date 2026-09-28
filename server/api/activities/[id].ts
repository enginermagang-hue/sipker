import { and, asc, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { activities, schools, activityCategories, users, regions, evidence, activityReviews } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const db = createDb()

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

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Activity not found' })

  // Authorization
  if (user.roleCode === 'anggota' && row.createdBy !== user.id) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  if (user.roleCode === 'koordinator' && row.regionId !== user.regionId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const ev = await db.select().from(evidence).where(and(eq(evidence.activityId, id), isNull(evidence.deletedAt)))
  const reviews = await db.select().from(activityReviews).where(eq(activityReviews.activityId, id)).orderBy(asc(activityReviews.createdAt))

  return { data: row, evidence: ev, reviews }
})