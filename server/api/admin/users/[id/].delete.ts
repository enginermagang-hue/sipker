import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { users } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

// Handler untuk menghapus (soft delete) pengguna berdasarkan ID (DELETE)
// Hanya bisa diakses oleh user dengan role 'admin'
// Parameter: id (dari router param)
// Melakukan soft delete dengan mengisi deletedAt dan updatedAt dengan timestamp saat ini
// Return: objek berisi id dari pengguna yang berhasil dihapus
// Jika pengguna tidak ditemukan atau sudah dihapus, throw error 404
export default defineEventHandler(async (event) => {
  // Autentikasi: memastikan request memiliki session user yang valid
  const user = await requireAuth(event)
  // Authorization: memastikan user yang mengakses memiliki role 'admin'
  requireRole(user, 'admin')
  // Mengambil parameter 'id' dari URL route
  const id = getRouterParam(event, 'id')!
  const db = createDb()

  // Soft delete: memperbarui tabel users dengan mengisi deletedAt dan updatedAt
  // Filter: hanya user yang belum dihapus (deletedAt is null) agar tidak double-delete
  // Return row yang diperbarui
  const [row] = await db
    .update(users)
    .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning()

  // Jika tidak ditemukan data, lemparkan error 404
  // Ini berarti pengguna sudah tidak ada atau sudah dihapus sebelumnya
  if (!row) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  // Return id pengguna yang berhasil dihapus secara soft delete
  return { data: { id: row.id } }
})
