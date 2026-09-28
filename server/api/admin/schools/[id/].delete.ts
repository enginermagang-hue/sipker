// Handler untuk menghapus sekolah secara soft delete berdasarkan ID.
// Hanya dapat diakses oleh user dengan role 'admin'.
// Tidak menghapus data secara permanen, melainkan mengisi kolom deletedAt dengan timestamp saat ini.
// Mengembalikan data sekolah yang telah dihapus, atau melempar error 404 jika sekolah tidak ditemukan.
export default defineEventHandler(async (event) => {
  // Mengautentikasi user dari request event dan memastikan user telah login.
  const user = await requireAuth(event)
  // Memverifikasi bahwa user memiliki role 'admin' untuk mengakses endpoint ini.
  requireRole(user, 'admin')
  // Mengambil parameter 'id' dari URL router untuk mengidentifikasi sekolah yang akan dihapus.
  const id = getRouterParam(event, 'id')!
  const db = createDb()

  // Melakukan soft delete: memperbarui kolom deletedAt dan updatedAt pada sekolah yang sesuai dengan ID.
  // Memastikan sekolah belum dihapus sebelumnya dengan kondisi isNull(schools.deletedAt).
  // Tidak menghapus baris secara permanen dari database (soft delete pattern).
  const [row] = await db
    .update(schools)
    .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(and(eq(schools.id, id), isNull(schools.deletedAt)))
    .returning()

  // Jika tidak menemukan data sekolah (row undefined), lemparkan error 404.
  if (!row) throw createError({ statusCode: 404, statusMessage: 'School not found' })
  // Mengembalikan data sekolah yang telah dihapus (soft deleted) dalam format { data: row }.
  return { data: row }
})
