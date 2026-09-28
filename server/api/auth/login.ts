// Mengimpor fungsi createHash dan randomBytes dari modul crypto Node.js
import { createHash, randomBytes } from 'node:crypto'
// Mengimpor operator eq dari drizzle-orm untuk query bersyarat
import { eq } from 'drizzle-orm'
// Mengimpor fungsi createDb untuk membuat koneksi database
import { createDb } from '#server/database/index'
// Mengimpor skema users dan sessions dari database
import { users, sessions } from '#server/database/schema'
// Mengimpor fungsi verifyPassword untuk verifikasi hash password
import { verifyPassword } from '#server/utils/password'

// Handler utama untuk endpoint /api/auth/login
// Fungsi: Mengautentikasi pengguna dengan email dan password, membuat sesi baru, dan mengembalikan data profil
// Parameter: event - objek permintaan HTTP (Nuxt handler event) berisi body dengan email dan password
// Return: Objek berisi id, name, email, roleId, dan regionId dari pengguna yang berhasil login
export default defineEventHandler(async (event) => {
  // Membaca body dari permintaan HTTP
  const body = await readBody(event)
  // Mengambil email dari body, dikonversi ke lowercase dan di-trim untuk normalisasi
  const email = String(body.email || '').toLowerCase().trim()
  // Mengambil password dari body sebagai string mentah
  const password = String(body.password || '')

  // Validasi: memastikan email dan password tidak kosong
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  // Membuat koneksi database
  const db = createDb()
  // Query database untuk menemukan pengguna berdasarkan email
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  // Jika pengguna tidak ditemukan atau akun tidak aktif, lemparkan error 401
  if (!user || !user.isActive) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }
  // Verifikasi password yang dimasukkan sesuai dengan hash password yang tersimpan
  if (!verifyPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  // Membuat token sesi baru: menghasilkan 48 byte acak dan dikonversi ke hex
  const token = randomBytes(48).toString('hex')
  // Hash token tersebut dengan SHA-256 untuk disimpan di database (token asli tidak disimpan)
  const tokenHash = createHash('sha256').update(token).digest('hex')
  // Mencatat waktu saat ini
  const now = new Date()
  // Menghitung waktu kedaluwarsa sesi: 7 hari dari sekarang (7 * 24 * 60 * 60 * 1000 ms)
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

  // Menyisipkan catatan sesi baru ke database
  await db.insert(sessions).values({
    // ID sesi unik: 16 byte acak dalam format hex
    id: randomBytes(16).toString('hex'),
    // ID pengguna yang login
    userId: user.id,
    // Hash token untuk verifikasi sesi di kemudian hari
    tokenHash,
    // Waktu kedaluwarsa sesi
    expiresAt,
    // Alamat IP pengguna dari header x-forwarded-for atau string kosong
    ipAddress: getHeader(event, 'x-forwarded-for') || '',
    // User-Agent browser pengguna atau string kosong
    userAgent: getHeader(event, 'user-agent') || '',
    // Waktu pembuatan sesi
    createdAt: now.toISOString(),
  })

  // Update field lastLoginAt pada catatan pengguna menjadi waktu sekarang
  await db.update(users).set({ lastLoginAt: now.toISOString() }).where(eq(users.id, user.id))

  // Mengatur cookie 'sid' di browser dengan token sesi
  setCookie(event, 'sid', token, {
    // httpOnly: true mencegah akses cookie dari JavaScript (perlindungan XSS)
    httpOnly: true,
    // sameSite: 'lax' membantu mencegah serangan CSRF
    sameSite: 'lax',
    // secure: true hanya mengirim cookie melalui HTTPS di lingkungan produksi
    secure: process.env.NODE_ENV === 'production',
    // maxAge: 7 hari dalam detik (7 * 24 * 60 * 60)
    maxAge: 7 * 24 * 60 * 60,
    // Path cookie berlaku untuk seluruh aplikasi
    path: '/',
  })

  // Mengembalikan data profil pengguna sebagai response sukses login
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    regionId: user.regionId,
  }
})
