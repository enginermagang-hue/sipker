// Handler untuk mengambil detail sebuah kategori aktivitas berdasarkan ID.
// Hanya dapat diakses oleh user dengan role 'admin'.
// Menggunakan soft delete check untuk memastikan kategori tidak sedang dihapus.
// Mengembalikan data kategori jika ditemukan, atau melempar error 404 jika tidak ditemukan.
export default defineEventHandler(async (event) => {
  // Mengautentikasi user dari request event dan memastikan user telah login.
  const user = await requireAuth(event)
  // Memverifikasi bahwa user memiliki role 'admin' untuk mengakses endpoint ini.
  requireRole(user, 'admin')
  // Mengambil parameter 'id' dari URL router untuk mengidentifikasi kategori yang dicari.
  const id = getRouterParam(event, 'id')!
  const db = createDb()
  // Query database: memilih satu baris dari tabel activityCategories berdasarkan ID yang cocok
  // dan memastikan kategori belum dihapus (deletedAt is null).
  // Batasi hasil hanya 1 baris menggunakan limit(1).
  const [row] = await db.select().from(activityCategories).where(and(eq(activityCategories.id, id), isNull(activityCategories.deletedAt))).limit(1)
  // Jika tidak menemukan data kategori (row undefined), lemparkan error 404.
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  // Mengembalikan data kategori yang ditemukan dalam format { data: row }.
  return { data: row }
})
