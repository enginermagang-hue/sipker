// Handler untuk mengambil daftar semua kategori aktivitas yang belum dihapus (soft delete).
// Hanya dapat diakses oleh user dengan role 'admin'.
// Mengembalikan array of kategori yang diurutkan berdasarkan sortOrder dan nama secara ascending.
export default defineEventHandler(async (event) => {
  // Mengautentikasi user dari request event dan memastikan user telah login.
  const user = await requireAuth(event)
  // Memverifikasi bahwa user memiliki role 'admin' untuk mengakses endpoint ini.
  requireRole(user, 'admin')
  const db = createDb()
  // Query database: memilih semua kolom dari tabel activityCategories di mana deletedAt bernilai null
  // (menandakan kategori belum dihapus), diurutkan berdasarkan sortOrder terlebih dahulu,
  // kemudian nama secara ascending.
  const rows = await db
    .select()
    .from(activityCategories)
    .where(isNull(activityCategories.deletedAt))
    .orderBy(asc(activityCategories.sortOrder), asc(activityCategories.name))
  // Mengembalikan data kategori dalam format { data: rows }.
  return { data: rows }
})
