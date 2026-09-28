import { randomBytes } from 'node:crypto'
import { createDb } from '#server/database/index'
import { regions } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

// Handler POST /api/admin/regions — membuat region baru dengan data yang diberikan oleh admin
// Parameter: event (request HTTP) — body berisi code, name, description, isActive
// Return: { data: Region } — region yang baru dibuat, atau error jika gagal
export default defineEventHandler(async (event) => {
  // Mengautentikasi pengguna dari session
  const user = await requireAuth(event)
  // Memastikan pengguna memiliki peran admin
  requireRole(user, 'admin')
  // Membaca body dari request HTTP
  const body = await readBody(event)
  // Mencetak log body untuk verifikasi data diterima
  console.log('[POST /api/admin/regions] Body diterima:', JSON.stringify(body))

  // Membuat koneksi database Turso menggunakan createDb
  console.log('[POST /api/admin/regions] Membuat koneksi database...')
  const db = createDb()
  console.log('[POST /api/admin/regions] Koneksi database berhasil.')

  try {
    // Mencetak log untuk memantau proses insert sebelum eksekusi
    console.log('[POST /api/admin/regions] Memulai insert wilayah — kode:', body.code, 'nama:', body.name)

    // Mencoba insert region baru ke tabel regions dengan nilai dari body
    const [row] = await db
      .insert(regions)
      .values({
        id: randomBytes(16).toString('hex'), // menghasilkan ID unik 32 karakter hex
        code: String(body.code).trim().toUpperCase(), // kode region dalam huruf besar tanpa spasi
        name: String(body.name).trim(), // nama region tanpa spasi di awal/akhir
        description: body.description || null, // deskripsi opsional, default null
        isActive: body.isActive !== false, // status aktif, default true jika tidak disebutkan
        createdAt: new Date().toISOString(), // timestamp pembuatan saat ini
        updatedAt: new Date().toISOString(), // timestamp pembaruan saat ini
      })
      .returning() // mengembalikan data row yang baru disisipkan

    // Mencetak log sukses dengan detail data yang berhasil tersimpan
    console.log('[POST /api/admin/regions] Insert BERHASIL — id:', row.id, '| code:', row.code, '| name:', row.name, '| isActive:', row.isActive)

    // Mengembalikan region yang baru dibuat dalam format response JSON
    return { data: row }
  } catch (e: any) {
    // Mencetak log error lengkap jika insert gagal
    console.error('[POST /api/admin/regions] ERROR INSERT — pesan:', e.message || e, '| stack:', e.stack || 'tidak tersedia')
    // Melempar error HTTP 500 agar client menerima status error
    throw createError({ statusCode: 500, statusMessage: 'Gagal menyimpan wilayah: ' + (e.message || 'Terjadi kesalahan') })
  }
})
