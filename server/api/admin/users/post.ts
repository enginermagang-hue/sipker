import { randomBytes } from 'node:crypto'
import { createDb } from '#server/database/index'
import { users } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { hashPassword } from '#server/utils/password'

// Handler untuk membuat pengguna baru (POST)
// Hanya bisa diakses oleh user dengan role 'admin'
// Body request berisi: roleId, regionId (opsional), name, email, password, position (opsional), phone (opsional), isActive (opsional)
// Return: objek berisi id, email, dan name dari pengguna yang baru dibuat
export default defineEventHandler(async (event) => {
  // Autentikasi: memastikan request memiliki session user yang valid
  const user = await requireAuth(event)
  // Authorization: memastikan user yang mengakses memiliki role 'admin'
  requireRole(user, 'admin')
  // Membaca body request (data yang dikirim oleh client)
  const body = await readBody(event)
  const db = createDb()

  // Insert data baru ke tabel users
  // ID dihasilkan secara acak (16 byte hex)
  // Password di-hash sebelum disimpan menggunakan hashPassword
  // Email di-normalisasi ke lowercase
  // isActive default true jika tidak disediakan (body.isActive !== false)
  // Password default 'password123' jika tidak disediakan di body
  const [row] = await db
    .insert(users)
    .values({
      id: randomBytes(16).toString('hex'),
      roleId: String(body.roleId),
      regionId: body.regionId ? String(body.regionId) : null,
      name: String(body.name).trim(),
      email: String(body.email).trim().toLowerCase(),
      passwordHash: hashPassword(String(body.password || 'password123')),
      position: body.position || null,
      phone: body.phone || null,
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning()

  // Return data pengguna yang baru dibuat (hanya id, email, name)
  return { data: { id: row.id, email: row.email, name: row.name } }
})
