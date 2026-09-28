// Mengimpor fungsi createHash dari modul crypto Node.js untuk hashing token
import { createHash } from 'node:crypto'
// Mengimpor fungsi createDb untuk membuat koneksi database
import { createDb } from '#server/database/index'
// Mengimpor skema sessions dari database
import { sessions } from '#server/database/schema'
// Mengimpor operator eq dari drizzle-orm untuk query bersyarat
import { eq } from 'drizzle-orm'

// Handler utama untuk endpoint /api/auth/logout
// Fungsi: Membatalkan sesi pengguna dengan mencabut token dan menghapus cookie
// Parameter: event - objek permintaan HTTP (Nuxt handler event)
// Return: Objek { ok: true } menandakan logout berhasil
export default defineEventHandler(async (event) => {
  // Mengambil nilai cookie 'sid' (session ID) dari permintaan
  const token = getCookie(event, 'sid')
  // Jika token ditemukan, lanjutkan proses pencabutan sesi
  if (token) {
    // Hash token menggunakan SHA-256 untuk menyimpan hash di database
    const tokenHash = createHash('sha256').update(token).digest('hex')
    // Membuat koneksi database
    const db = createDb()
    // Update catatan sesi di database: set revokedAt ke waktu sekarang berdasarkan tokenHash
    await db.update(sessions).set({ revokedAt: new Date().toISOString() }).where(eq(sessions.tokenHash, tokenHash))
  }
  // Menghapus cookie 'sid' dari browser untuk menghancurkan sesi di sisi client
  clearCookie(event, 'sid', { path: '/' })
  // Mengembalikan response sukses
  return { ok: true }
})
