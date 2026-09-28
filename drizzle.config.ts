// Konfigurasi Drizzle Kit — mengatur migrasi database dan skema ORM untuk aplikasi Si Kinerja
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  // Direktori output untuk file migrasi database — semua migrasi SQLite disimpan di sini
  out: './server/database/migrations',
  // Jalur ke file skema database — mendefinisikan tabel dan relasi menggunakan Drizzle ORM
  schema: './server/database/schema.ts',
  // Dialek database yang digunakan — SQLite untuk pengembangan dan Turso untuk produksi
  dialect: 'sqlite',
  // Kredensial koneksi database — menggunakan URL dari environment variable atau file lokal untuk dev
  dbCredentials: {
    // URL database Turso dari environment variable, fallback ke file SQLite lokal untuk pengembangan
    url: process.env.TURSO_DATABASE_URL || 'file:./dev.db'
  }
})
