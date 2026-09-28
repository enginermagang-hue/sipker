import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { regions } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

// Handler DELETE /api/admin/regions/:id — menghapus region secara lunak (soft delete) dengan menandai deletedAt, hanya jika belum dihapus
// Parameter: event (request HTTP) — id diambil dari router parameter
// Return: { data: Region } — region yang sudah dihapus (dengan deletedAt terisi)
// Throws: 404 jika region tidak ditemukan atau sudah dihapus
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) // mengautentikasi pengguna dari session
  requireRole(user, 'admin') // memastikan pengguna memiliki peran admin
  const id = getRouterParam(event, 'id')! // mengambil parameter ID dari URL route
  const db = createDb() // membuat koneksi database

  // Soft delete: memperbarui deletedAt dan updatedAt dengan timestamp saat ini, bukan menghapus record secara permanen
  // Query: memperbarui berdasarkan ID dan memastikan deletedAt null (belum dihapus)
  const [row] = await db
    .update(regions)
    .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }) // menandai tanggal penghapusan dan pembaruan
    .where(and(eq(regions.id, id), isNull(regions.deletedAt))) // kondisi: ID cocok dan belum dihapus
    .returning() // mengembalikan data row yang sudah diperbarui

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Region not found' }) // melempar error 404 jika region tidak ditemukan atau sudah dihapus
  return { data: row } // mengembalikan region yang sudah dihapus dalam format response
})
