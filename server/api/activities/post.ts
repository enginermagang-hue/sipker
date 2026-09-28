import { randomBytes } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { activities, schools, users } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { writeAudit } from '#server/utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, 'admin', 'kepala', 'koordinator', 'anggota')
  const body = await readBody(event)
  const db = createDb()

  // Region must come from the user, not the browser
  let regionId = user.regionId
  if (!regionId) {
    // admin/kepala creating on behalf of someone — must supply regionId
    regionId = String(body.regionId)
  }

  // Validate school belongs to region
  const [school] = await db.select().from(schools).where(and(eq(schools.id, String(body.schoolId)), eq(schools.regionId, regionId))).limit(1)
  if (!school) throw createError({ statusCode: 400, statusMessage: 'School not found in region' })

  const now = new Date().toISOString()
  const [row] = await db
    .insert(activities)
    .values({
      id: randomBytes(16).toString('hex'),
      createdBy: user.id,
      regionId,
      schoolId: school.id,
      categoryId: String(body.categoryId),
      activityAt: String(body.activityAt),
      consultantName: String(body.consultantName).trim(),
      consultantPosition: body.consultantPosition || null,
      consultantNip: body.consultantNip || null,
      topic: String(body.topic).trim(),
      actionTaken: String(body.actionTaken).trim(),
      result: String(body.result).trim(),
      followUp: body.followUp || null,
      notes: body.notes || null,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  await writeAudit(user, 'activity', row.id, 'create', null, row, event)

  return { data: row }
})