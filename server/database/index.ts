import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

// Fungsi untuk membuat dan mengembalikan instance database Drizzle
// Menggunakan client LibSQL yang terhubung ke database Turso
// Mengembalikan drizzle instance yang siap digunakan untuk query database
export function createDb() {
  // Membuat client LibSQL dengan URL dan auth token dari environment variable
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })

  // Mengembalikan drizzle instance yang dikonfigurasi dengan client dan schema
  return drizzle({ client, schema })
}

// Tipe Database yang merepresentasikan return type dari fungsi createDb
// Digunakan untuk type safety saat bekerja dengan database di seluruh aplikasi
export type Database = ReturnType<typeof createDb>
