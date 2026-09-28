import { asc, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { regions } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

// Handler GET /api/admin/regions — mengambil semua region yang belum dihapus, diurutkan berdasarkan kode secara ascending
// Parameter: event (request HTTP)
// Return: { data: Array<Region> } — daftar region yang aktif (deletedAt null)
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) // mengautentikasi pengguna dari session
  requireRole(user, 'admin') // memastikan pengguna memiliki peran admin
  const db = createDb() // membuat koneksi database
  // Query: memilih semua region di mana deletedAt adalah null (belum dihapus), diurutkan berdasarkan code ascending
  const rows = await db.select().from(regions).where(isNull(regions.deletedAt)).orderBy(asc(regions.code))
  return { data: rows } // mengembalikan daftar region dalam format response
})
