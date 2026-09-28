import { asc, and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { users } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { hashPassword } from '#server/utils/password'

// Handler untuk mengambil daftar semua pengguna aktif (tanpa data deletedAt)
// Diurutkan berdasarkan nama secara ascending
// Hanya bisa diakses oleh user dengan role 'admin'
// Return: objek berisi array data pengguna (id, roleId, regionId, name, email, position, phone, isActive, lastLoginAt, createdAt)
export default defineEventHandler(async (event) => {
  // Autentikasi: memastikan request memiliki session user yang valid
  const user = await requireAuth(event)
  // Authorization: memastikan user yang mengakses memiliki role 'admin'
  requireRole(user, 'admin')
  const db = createDb()
  // Query database: select kolom-kolom tertentu dari tabel users
  // Filter: hanya user yang belum dihapus (deletedAt is null)
  // Urutkan: berdasarkan nama ascending
  const rows = await db
    .select({
      id: users.id,
      roleId: users.roleId,
      regionId: users.regionId,
      name: users.name,
      email: users.email,
      position: users.position,
      phone: users.phone,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(asc(users.name))
  // Return hasil query berupa array data pengguna
  return { data: rows }
})
