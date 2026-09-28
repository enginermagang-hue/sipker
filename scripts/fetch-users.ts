// Script untuk membaca semua data users dari database Turso (read-only)
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { users } from '../server/database/schema'

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })
  const db = drizzle({ client, schema: { users } })

  const result = await db.select().from(users)
  console.log('Data users dari Turso:')
  console.table(result)
  console.log('Total users:', result.length)
}

main().catch(console.error)
