// Handler untuk mengambil detail sebuah sekolah berdasarkan ID.
// Hanya dapat diakses oleh user dengan role 'admin'.
// Mengembalikan data sekolah jika ditemukan, atau melempar error 404 jika tidak ditemukan.
export default defineEventHandler(async (event) => {
  // Mengautentikasi user dari request event dan memastikan user telah login.
  const user = await requireAuth(event)
  // Memverifikasi bahwa user memiliki role 'admin' untuk mengakses endpoint ini.
  requireRole(user, 'admin')
  // Mengambil parameter 'id' dari URL router untuk mengidentifikasi sekolah yang dicari.
  const id = getRouterParam(event, 'id')!
  const db = createDb()
  // Query database: memilih satu baris dari tabel schools berdasarkan ID yang cocok.
  // Batasi hasil hanya 1 baris menggunakan limit(1).
  const [row] = await db.select().from(schools).where(eq(schools.id, id)).limit(1)
  // Jika tidak menemukan data sekolah (row undefined), lemparkan error 404.
  if (!row) throw createError({ statusCode: 404, statusMessage: 'School not found' })
  // Mengembalikan data sekolah yang ditemukan dalam format { data: row }.
  return { data: row }
})
