// Handler untuk membuat kategori aktivitas baru.
// Hanya dapat diakses oleh user dengan role 'admin'.
// Menerima data kategori dari request body dan menyimpannya ke database dengan ID unik.
export default defineEventHandler(async (event) => {
  // Mengautentikasi user dari request event dan memastikan user telah login.
  const user = await requireAuth(event)
  // Memverifikasi bahwa user memiliki role 'admin' untuk mengakses endpoint ini.
  requireRole(user, 'admin')
  // Membaca body dari request event untuk mendapatkan data kategori yang akan dibuat.
  const body = await readBody(event)
  const db = createDb()

  // Menyisipkan data kategori aktivitas baru ke dalam tabel activityCategories.
  // ID dihasilkan secara acak menggunakan crypto random bytes (16 byte → hex string).
  // code dikonversi ke lowercase dan di-trim untuk konsistensi.
  // name di-trim. description opsional (default null jika tidak ada).
  // sortOrder default 0 jika tidak ada atau tidak valid.
  // isActive default true kecuali body.isActive bernilai false.
  // createdAt dan updatedAt diisi dengan timestamp saat ini.
  const [row] = await db
    .insert(activityCategories)
    .values({
      id: randomBytes(16).toString('hex'),
      code: String(body.code).trim().toLowerCase(),
      name: String(body.name).trim(),
      description: body.description || null,
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning()

  // Mengembalikan data kategori yang baru dibuat dalam format { data: row }.
  return { data: row }
})
