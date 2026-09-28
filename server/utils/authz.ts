// Memastikan pengguna memiliki salah satu peran yang diperlukan untuk mengakses resource
// Parameter: user - objek pengguna yang berisi roleCode
// Parameter: codes - array string kode peran yang diizinkan
// Throw: kesalahan 403 jika pengguna tidak memiliki peran yang sesuai
export function requireRole(user: any, ...codes: string[]) {
  // Periksa apakah kode peran pengguna ada dalam daftar peran yang diizinkan
  if (!codes.includes(user.roleCode)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: insufficient role' })
  }
}

// Memastikan pengguna memiliki akses ke wilayah (region) tertentu
// Koordinator/Anggota wajib memiliki region; Admin/Kepala boleh berskala global (regionId bisa null)
// Parameter: user - objek pengguna yang berisi roleCode dan regionId
// Parameter: regionId - ID wilayah yang harus diakses
// Throw: kesalahan 403 jika pengguna tidak memiliki wilayah atau wilayah tidak cocok
export function requireRegionScope(user: any, regionId: string) {
  // Admin dan Kepala memiliki akses global, tidak perlu pengecekan region
  if (user.roleCode === 'admin' || user.roleCode === 'kepala') return

  // Periksa apakah pengguna memiliki wilayah yang ditugaskan
  if (!user.regionId) {
    throw createError({ statusCode: 403, statusMessage: 'User has no region scope' })
  }

  // Periksa apakah wilayah pengguna cocok dengan wilayah yang diminta
  if (user.regionId !== regionId) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: region mismatch' })
  }
}
