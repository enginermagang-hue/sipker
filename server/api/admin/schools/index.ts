// Handler untuk mengambil daftar semua sekolah yang belum dihapus (soft delete).
// Hanya dapat diakses oleh user dengan role 'admin'.
// Mengembalikan array of sekolah yang diurutkan berdasarkan nama secara ascending.
export default defineEventHandler(async (event) => {
  // Mengautentikasi user dari request event dan memastikan user telah login.
  const user = await requireAuth(event)
  // Memverifikasi bahwa user memiliki role 'admin' untuk mengakses endpoint ini.
  requireRole(user, 'admin')
  const db = createDb()
  // Query database: memilih semua kolom dari tabel schools di mana deletedAt bernilai null
  // (menandakan sekolah belum dihapus), diurutkan berdasarkan nama secara ascending.
  const rows = await db
    .select()
    .from(schools)
    .where(isNull(schools.deletedAt))
    .asc(schools.name)
  // Mengembalikan data sekolah dalam format { data: rows }.
  return { data: rows }
})
