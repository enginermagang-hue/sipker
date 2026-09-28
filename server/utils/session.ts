import { createHash } from 'node:crypto'
import { getCookie } from 'h3'
import { createDb } from '#server/database/index'
import { users, roles, sessions } from '#server/database/schema'
import { and, eq, isNull } from 'drizzle-orm'

// Mengambil pengguna yang sedang masuk berdasarkan cookie sesi
// Parameter: event - objek permintaan HTTP yang berisi cookie
// Return: objek pengguna jika ditemukan dan valid, atau null jika tidak
export async function getCurrentUser(event: any) {
  // Ambil token sesi dari cookie 'sid'
  const token = getCookie(event, 'sid')
  if (!token) return null

  // Hash token menggunakan SHA-256 untuk perbandingan yang aman
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const db = createDb()

  // Cari sesi yang cocok dengan token hash dan belum dicabut
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt)))
    .limit(1)

  if (!session) return null

  // Periksa apakah sesi sudah kedaluwarsa
  if (new Date(session.expiresAt).getTime() < Date.now()) return null

  // Ambil data pengguna beserta perannya dari database
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

  // Perbarui waktu penggunaan terakhir sesi (touch session)
  await db.update(sessions).set({ lastUsedAt: new Date().toISOString() }).where(eq(sessions.id, session.id))

  return user
}

// Memastikan pengguna sudah terotentikasi sebelum mengakses route
// Parameter: event - objek permintaan HTTP
// Return: objek pengguna jika terotentikasi
// Throw: kesalahan 401 jika pengguna tidak terotentikasi
export async function requireAuth(event: any) {
  const user = await getCurrentUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  return user
}
