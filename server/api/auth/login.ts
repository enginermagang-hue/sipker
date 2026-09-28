import { createHash, randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { users, sessions } from '#server/database/schema'
import { verifyPassword } from '#server/utils/password'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body.email || '').toLowerCase().trim()
  const password = String(body.password || '')

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const db = createDb()
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (!user || !user.isActive) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }
  if (!verifyPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  // Create session
  const token = randomBytes(48).toString('hex')
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

  await db.insert(sessions).values({
    id: randomBytes(16).toString('hex'),
    userId: user.id,
    tokenHash,
    expiresAt,
    ipAddress: getHeader(event, 'x-forwarded-for') || '',
    userAgent: getHeader(event, 'user-agent') || '',
    createdAt: now.toISOString(),
  })

  // Update last login
  await db.update(users).set({ lastLoginAt: now.toISOString() }).where(eq(users.id, user.id))

  setCookie(event, 'sid', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    regionId: user.regionId,
  }
})