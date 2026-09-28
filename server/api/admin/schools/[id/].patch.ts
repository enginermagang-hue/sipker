// Handler untuk memperbarui data sekolah berdasarkan ID.
// Hanya dapat diakses oleh user dengan role 'admin'.
// Menerima data perubahan dari request body dan memperbarui sekolah yang ditemukan.
// Menggunakan soft delete check untuk memastikan sekolah tidak sedang dihapus.
export default defineEventHandler(async (event) => {
  // Mengautentikasi user dari request event dan memastikan user telah login.
  const user = await requireAuth(event)
  // Memverifikasi bahwa user memiliki role 'admin' untuk mengakses endpoint ini.
  requireRole(user, 'admin')
  // Mengambil parameter 'id' dari URL router untuk mengidentifikasi sekolah yang akan diperbarui.
  const id = getRouterParam(event, 'id')!
  // Membaca body dari request event untuk mendapatkan data perubahan sekolah.
  const body = await readBody(event)
  const db = createDb()

  // Memperbarui data sekolah di tabel schools berdasarkan ID dan memastikan sekolah belum dihapus (deletedAt is null).
  // regionId dikonversi ke string, name di-trim.
  // npsn dan address opsional (default null jika tidak ada).
  // isActive default true kecuali body.isActive bernilai false.
  // updatedAt diperbarui dengan timestamp saat ini.
  const [row] = await db
    .update(schools)
    .set({
      regionId: String(body.regionId),
      name: String(body.name).trim(),
      npsn: body.npsn || null,
      address: body.address || null,
      isActive: body.isActive !== false,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(schools.id, id), isNull(schools.deletedAt)))
    .returning()

  // Jika tidak menemukan data sekolah (row undefined), lemparkan error 404.
  // Ini berarti sekolah tidak ditemukan atau sudah dihapus secara soft delete.
  if (!row) throw createError({ statusCode: 404, statusMessage: 'School not found' })
  // Mengembalikan data sekolah yang telah diperbarui dalam format { data: row }.
  return { data: row }
})
