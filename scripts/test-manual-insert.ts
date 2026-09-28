import { randomBytes } from 'node:crypto'
import { createDb } from '#server/database/index'
import { regions } from '#server/database/schema'

// Script untuk menguji operasi insert langsung menggunakan kode dari post.ts
async function main() {
  console.log('=== Tes Insert Manual ===')
  try {
    const db = createDb()
    const row = await db.insert(regions).values({
      id: randomBytes(16).toString('hex'),
      code: 'MANTEST',
      name: 'Wilayah Manual Test',
      description: 'Tes manual',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning()
    console.log('Insert berhasil:', row)
    // Bersihkan
    await db.delete(regions).where({ id: row[0].id })
    console.log('Data dibersihkan.')
  } catch (e: any) {
    console.error('Error insert:', e.message || e)
  }
}
main()
