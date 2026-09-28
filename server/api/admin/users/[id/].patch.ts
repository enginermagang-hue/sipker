import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { users } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { hashPassword } from '#server/utils/password'

// Handler untuk memperbarui data pengguna berdasarkan ID (PATCH / partial update)
// Hanya bisa diakses oleh user dengan role 'admin'
// Parameter: id (dari router param), body berisi field yang akan diperbarui (roleId, regionId, name, email, position, phone, isActive, password opsional)
// Return: objek berisi data pengguna yang telah diperbarui, kecuali passwordHash
// Jika pengguna tidak ditemukan atau sudah dihapus, throw error 404
export default defineEventHandler(async (event) => {
  // Autentikasi: memastikan request memiliki session user yang valid
  const user = await requireAuth(event)
  // Authorization: memastikan user yang mengakses memiliki role 'admin'
  requireRole(user, 'admin')
  // Mengambil parameter 'id' dari URL route
  const id = getRouterParam(event, 'id')!
  // Membaca body request (data partial yang akan diperbarui)
  const body = await readBody(event)
  const db = createDb()

  // Menyusun objek nilai untuk update berdasarkan field yang ada di body
  // Semua field dikonversi ke tipe data yang sesuai (String, null, dll)
  // Email di-normalisasi ke lowercase
  // updatedAt di-set ke waktu saat ini
  const values: any = {
    roleId: String(body.roleId),
    regionId: body.regionId ? String(body.regionId) : null,
    name: String(body.name).trim(),
    email: String(body.email).trim().toLowerCase(),
    position: body.position || null,
    phone: body.phone || null,
    isActive: body.isActive !== false,
    updatedAt: new Date().toISOString(),
  }

  // Jika password disediakan di body, hash password tersebut dan tambahkan ke nilai update
  // Ini memungkinkan pengguna untuk mengganti password secara terpisah
  if (body.password) {
    values.passwordHash = hashPassword(String(body.password))
  }

  // Update data pengguna di database berdasarkan ID dan filter deletedAt is null
  // Return row yang diperbarui
  const [row] = await db.update(users).set(values).where(and(eq(users.id, id), isNull(users.deletedAt))).returning()
  // Jika tidak ditemukan data, lemparkan error 404
  if (!row) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  // Destructuring: pisahkan passwordHash dari data response untuk keamanan
  const { passwordHash, ...safe } = row
  // Return data pengguna yang telah diperbarui tanpa password hash
  return { data: safe }
})
