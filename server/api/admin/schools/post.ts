// Handler untuk membuat sekolah baru.
// Hanya dapat diakses oleh user dengan role 'admin'.
// Menerima data sekolah dari request body dan menyimpannya ke database dengan ID unik.
export default defineEventHandler(async (event) => {
  // Mengautentikasi user dari request event dan memastikan user telah login.
  const user = await requireAuth(event)
  // Memverifikasi bahwa user memiliki role 'admin' untuk mengakses endpoint ini.
  requireRole(user, 'admin')
  // Membaca body dari request event untuk mendapatkan data sekolah yang akan dibuat.
  const body = await readBody(event)
  const db = createDb()

  // Menyisipkan data sekolah baru ke dalam tabel schools.
  // ID dihasilkan secara acak menggunakan crypto random bytes (16 byte → hex string).
  // regionId dikonversi ke string, name di-trim (dihapus spasi di awal/akhir).
  // npsn dan address bersifat opsional (default null jika tidak ada).
  // isActive default true kecuali body.isActive bernilai false.
  // createdAt dan updatedAt diisi dengan timestamp saat ini.
  const [row] = await db
    .insert(schools)
    .values({
      id: randomBytes(16).toString('hex'),
      regionId: String(body.regionId),
      name: String(body.name).trim(),
      npsn: body.npsn || null,
      address: body.address || null,
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning()

  // Mengembalikan data sekolah yang baru dibuat dalam format { data: row }.
  return { data: row }
})
