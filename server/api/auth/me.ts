// Mengimpor fungsi getCurrentUser untuk mengambil data pengguna dari sesi aktif
import { getCurrentUser } from '#server/utils/session'

// Handler utama untuk endpoint /api/auth/me
// Fungsi: Mengambil informasi profil pengguna yang sedang terautentikasi
// Parameter: event - objek permintaan HTTP (Nuxt handler event)
// Return: Objek berisi id, name, email, roleCode, dan regionId dari pengguna
export default defineEventHandler(async (event) => {
  // Memanggil getCurrentUser untuk mengambil data pengguna dari cookie sesi
  const user = await getCurrentUser(event)
  // Jika tidak ada pengguna (tidak terautentikasi), lemparkan error 401
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  // Mengembalikan data profil pengguna tanpa informasi sensitif seperti passwordHash
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleCode: user.roleCode,
    regionId: user.regionId,
  }
})
