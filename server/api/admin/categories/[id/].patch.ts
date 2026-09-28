// Handler untuk memperbarui data kategori aktivitas berdasarkan ID.
// Hanya dapat diakses oleh user dengan role 'admin'.
// Menerima data perubahan dari request body dan memperbarui kategori yang ditemukan.
// Menggunakan soft delete check untuk memastikan kategori tidak sedang dihapus.
export default defineEventHandler(async (event) => {
  // Mengautentikasi user dari request event dan memastikan user telah login.
  const user = await requireAuth(event)
  // Memverifikasi bahwa user memiliki role 'admin' untuk mengakses endpoint ini.
  requireRole(user, 'admin')
  // Mengambil parameter 'id' dari URL router untuk mengidentifikasi kategori yang akan diperbarui.
  const id = getRouterParam(event, 'id')!
  // Membaca body dari request event untuk mendapatkan data perubahan kategori.
  const body = await readBody(event)
  const db = createDb()

  // Memperbarui data kategori di tabel activityCategories berdasarkan ID dan memastikan kategori belum dihapus (deletedAt is null).
  // code dikonversi ke lowercase dan di-trim untuk konsistensi.
  // name di-trim. description opsional (menggunakan ?? undefined agar null di database jika tidak ada).
  // sortOrder default 0 jika tidak ada atau tidak valid.
  // isActive default true kecuali body.isActive bernilai false.
  // updatedAt diperbarui dengan timestamp saat ini.
  const [row] = await db
    .update(activityCategories)
    .set({
      code: String(body.code).trim().toLowerCase(),
      name: String(body.name).trim(),
      description: body.description ?? undefined,
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive !== false,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(activityCategories.id, id), isNull(activityCategories.deletedAt)))
    .returning()

  // Jika tidak menemukan data kategori (row undefined), lemparkan error 404.
  // Ini berarti kategori tidak ditemukan atau sudah dihapus secara soft delete.
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  // Mengembalikan data kategori yang telah diperbarui dalam format { data: row }.
  return { data: row }
})
