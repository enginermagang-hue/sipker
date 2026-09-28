import { randomBytes } from 'node:crypto'
import { createDb } from '#server/database/index'
import { regions } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

// Handler POST /api/admin/regions — membuat region baru dengan data yang diberikan oleh admin
// Parameter: event (request HTTP) — body berisi code, name, description, isActive
// Return: { data: Region } — region yang baru dibuat
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) // mengautentikasi pengguna dari session
  requireRole(user, 'admin') // memastikan pengguna memiliki peran admin
  const body = await readBody(event) // membaca body dari request
  const db = createDb() // membuat koneksi database

  // Insert region baru: menghasilkan ID acak 16 byte, code di-uppercase, name di-trim, description default null, isActive default true
  // Field createdAt dan updatedAt diisi dengan timestamp saat ini
  const [row] = await db
    .insert(regions)
    .values({
      id: randomBytes(16).toString('hex'), // menghasilkan ID unik 32 karakter hex
      code: String(body.code).trim().toUpperCase(), // kode region dalam huruf besar tanpa spasi
      name: String(body.name).trim(), // nama region tanpa spasi di awal/akhir
      description: body.description || null, // deskripsi opsional, default null
      isActive: body.isActive !== false, // status aktif, default true jika tidak disebutkan
      createdAt: new Date().toISOString(), // timestamp pembuatan
      updatedAt: new Date().toISOString(), // timestamp pembaruan
    })
    .returning() // mengembalikan data row yang baru disisipkan

  return { data: row } // mengembalikan region yang baru dibuat dalam format response
})
