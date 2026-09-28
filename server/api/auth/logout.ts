import { createHash } from 'node:crypto'
import { createDb } from '#server/database/index'
import { sessions } from '#server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'sid')
  if (token) {
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const db = createDb()
    await db.update(sessions).set({ revokedAt: new Date().toISOString() }).where(eq(sessions.tokenHash, tokenHash))
  }
  clearCookie(event, 'sid', { path: '/' })
  return { ok: true }
})