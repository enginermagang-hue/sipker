import { createClient } from '@libsql/client'
import { randomBytes } from 'node:crypto'

// Script manual untuk menyimpan data seperti post.ts
async function main() {
  console.log('=== Tes Manual Post ===')
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })
  try {
    const newRow = await client.execute(
      `INSERT INTO regions (id, code, name, description, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      [randomBytes(16).toString('hex'), 'MANTEST', 'Wilayah Manual', 'Tes', 1, new Date().toISOString(), new Date().toISOString()]
    )
    console.log('Insert berhasil:', newRow.rows)
    // Bersihkan
    await client.execute('DELETE FROM regions WHERE id = ?', [newRow.rows[0].id])
    console.log('Data dibersihkan.')
  } catch (e: any) {
    console.error('Error:', e.message || e)
  }
}
main()
