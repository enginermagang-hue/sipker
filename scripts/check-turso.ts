import { createClient } from '@libsql/client'

// Script untuk mengecek koneksi ke database Turso
// Menguji apakah URL dan token dari environment masih valid
async function main() {
  // Menampilkan judul dan status koneksi
  console.log('=== Cek Koneksi Turso ===')
  // Menampilkan URL database dari environment
  console.log('URL:', process.env.TURSO_DATABASE_URL)
  // Menampilkan apakah token tersedia
  console.log('Token tersedia:', !!process.env.TURSO_AUTH_TOKEN)

  try {
    // Membuat client Turso menggunakan URL dan token dari environment
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    })
    // Mencoba query sederhana untuk memastikan koneksi berhasil
    const result = await client.execute('SELECT 1')
    // Menampilkan hasil jika koneksi berhasil
    console.log('Koneksi berhasil:', result)
  } catch (e: any) {
    // Menampilkan pesan error jika koneksi gagal
    console.error('Koneksi gagal:', e.message || e)
  }
}

// Menjalankan fungsi utama
main()
