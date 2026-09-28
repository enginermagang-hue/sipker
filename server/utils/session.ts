import { createHash } from 'node:crypto'
import { createDb } from '#server/database/index'
import { users, roles, sessions } from '#server/database/schema'
import { and, eq, isNull } from 'drizzle-orm'

export async function getCurrentUser(event: any) {
  const token = getCookie(event, 'sid')
  if (!token) return null
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const db = createDb()

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt)))
    .limit(1)

  if (!session) return null
  if (new Date(session.expiresAt).getTime() < Date.now()) return null

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      regionId: users.regionId,
      isActive: users.isActive,
      roleCode: roles.code,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, session.userId))
    .limit(1)

  if (!user || !user.isActive) return null

  // Touch session
  await db.update(sessions).set({ lastUsedAt: new Date().toISOString() }).where(eq(sessions.id, session.id))

  return user
}

export async function requireAuth(event: any) {
  const user = await getCurrentUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  return user
}