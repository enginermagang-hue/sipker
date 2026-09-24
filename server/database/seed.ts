import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { randomUUID } from 'node:crypto'
import * as schema from './schema'
import { roles } from './schema'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

const db = drizzle({ client, schema })

async function main() {
  console.log('Seeding initial data...')

  const now = new Date().toISOString()

  await db.insert(schema.roles).values([
    {
      id: randomUUID(),
      code: 'admin',
      name: 'Admin',
      description: 'Manajemen aplikasi dan data referensi',
      isSystem: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      code: 'kepala',
      name: 'Kepala',
      description: 'Pemeriksa utama kegiatan',
      isSystem: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      code: 'koordinator',
      name: 'Koordinator Wilayah',
      description: 'Koordinator wilayah kerja',
      isSystem: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      code: 'anggota',
      name: 'Anggota Wilayah',
      description: 'Anggota wilayah kerja',
      isSystem: 1,
      createdAt: now,
      updatedAt: now,
    },
  ])

  console.log('Roles seeded.')

  const regionCodes = ['I', 'II', 'III', 'IV', 'V']
  const regionValues = regionCodes.map((code) => ({
    id: randomUUID(),
    code,
    name: `Wilayah ${code}`,
    description: `Wilayah kerja ${code}`,
    isActive: 1,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }))

  await db.insert(schema.regions).values(regionValues)
  console.log('Regions seeded.')

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
