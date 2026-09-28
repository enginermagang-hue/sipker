import { createClient } from '@libsql/client'
import { randomBytes } from 'node:crypto'

// Script untuk memverifikasi kenapa data tidak masuk saat submit form
// Meniru proses post.ts secara manual dan mencatat setiap langkah
async function main() {
  console.log('=== Verifikasi Kenapa Data Tidak Masuk ===')
  console.log('1. Membuat koneksi Turso...')
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })
  console.log('2. Koneksi berhasil.')

  try {
    console.log('3. Mencoba insert langsung...')
    const result = await db.execute(
      'INSERT INTO regions (id, code, name, description, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [
        randomBytes(16).toString('hex'),
        'VERIFTEST',
        'Wilayah Verifikasi',
        'Tes verifikasi manual',
        1,
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    )
    console.log('4. Insert berhasil:', result.rows[0])
    console.log('5. ID:', result.rows[0].id)
    console.log('6. Code:', result.rows[0].code)
    console.log('7. Name:', result.rows[0].name)

    console.log('8. Mencari data di database...')
    const check = await db.execute('SELECT * FROM regions WHERE id = ?', [result.rows[0].id])
    console.log('9. Data ditemukan:', check.rows.length > 0 ? 'YA' : 'TIDAK')

    console.log('10. Membersihkan data tes...')
    await db.execute('DELETE FROM regions WHERE id = ?', [result.rows[0].id])
    console.log('11. Data dibersihkan.')
  } catch (e: any) {
    console.error('ERROR:', e.message || e)
  }
}

main()
