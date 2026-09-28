import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { regions } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

// Handler GET /api/admin/regions/:id — mengambil detail satu region berdasarkan ID, hanya jika belum dihapus
// Parameter: event (request HTTP) — id diambil dari router parameter
// Return: { data: Region } — detail region yang ditemukan
// Throws: 404 jika region tidak ditemukan atau sudah dihapus
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) // mengautentikasi pengguna dari session
  requireRole(user, 'admin') // memastikan pengguna memiliki peran admin
  const id = getRouterParam(event, 'id')! // mengambil parameter ID dari URL route
  const db = createDb() // membuat koneksi database
  // Query: mencari region berdasarkan ID dan memastikan deletedAt null (belum dihapus), limit 1 result
  const [row] = await db.select().from(regions).where(and(eq(regions.id, id), isNull(regions.deletedAt))).limit(1)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Region not found' }) // melempar error 404 jika region tidak ditemukan
  return { data: row } // mengembalikan detail region dalam format response
})
