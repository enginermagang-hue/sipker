import { createClient } from '@libsql/client'

// Script untuk menguji operasi POST/INSERT langsung ke Turso
// Memastikan data baru berhasil tersimpan dan muncul saat dibaca
async function main() {
  console.log('=== Tes POST Wilayah ===')
  console.log('URL tersedia:', !!process.env.TURSO_DATABASE_URL)
  console.log('Token tersedia:', !!process.env.TURSO_AUTH_TOKEN)

  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    })

    // Membuat data wilayah baru
    const newId = 'test-' + Date.now()
    const newCode = 'TEST' + Math.floor(Math.random() * 100)
    console.log('Membuat wilayah baru:', newId, newCode)

    await client.execute(
      "INSERT INTO regions (id, code, name, description, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [newId, newCode, 'Wilayah Tes POST', 'Deskripsi tes', 1, new Date().toISOString(), new Date().toISOString()]
    )

    // Membaca kembali untuk memastikan data tersimpan
    const readResult = await client.execute("SELECT * FROM regions WHERE id = ?", [newId])
    console.log('Data setelah insert:', readResult.rows)

    // Membersihkan data tes
    await client.execute("DELETE FROM regions WHERE id = ?", [newId])
    console.log('Data tes berhasil dihapus.')
  } catch (e: any) {
    console.error('Error:', e.message || e)
  }
}

main()
