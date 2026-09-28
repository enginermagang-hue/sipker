import { createClient } from '@libsql/client'

// Script untuk menguji operasi INSERT ke database Turso
// Memastikan bahwa token dan URL masih memiliki izin menulis
async function main() {
  // Menampilkan status environment
  console.log('=== Tes Insert Turso ===')
  console.log('URL tersedia:', !!process.env.TURSO_DATABASE_URL)
  console.log('Token tersedia:', !!process.env.TURSO_AUTH_TOKEN)

  try {
    // Membuat koneksi ke Turso
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    })
    // Menjalankan query INSERT uji
    const result = await client.execute(
      "INSERT INTO regions (id, code, name, description, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *",
      ['test-check-001', 'TESTCHK', 'Wilayah Tes', null, 1, new Date().toISOString(), new Date().toISOString()]
    )
    // Menampilkan hasil insert jika berhasil
    console.log('INSERT berhasil:', result)
    // Menghapus data uji setelah berhasil
    await client.execute("DELETE FROM regions WHERE id = ?", ['test-check-001'])
    console.log('Data uji dihapus.')
  } catch (e: any) {
    // Menampilkan error jika insert gagal
    console.error('INSERT gagal:', e.message || e)
  }
}

main()
