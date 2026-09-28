import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { randomUUID } from 'node:crypto'
import * as schema from './schema'
import { roles, users } from './schema'
import { hashPassword } from '../utils/password'

// Membuat client LibSQL untuk koneksi ke database Turso
// Menggunakan URL dan auth token dari environment variable
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

// Membuat instance drizzle database dengan client dan schema yang telah didefinisikan
const db = drizzle({ client, schema })

// Fungsi utama untuk men-seed data awal ke dalam database
// Berfungsi untuk mengisi data role dan region yang dibutuhkan agar aplikasi dapat berjalan
async function main() {
  // Log untuk menandai proses seeding dimulai
  console.log('Seeding initial data...')

  // Mendapatkan timestamp saat ini dalam format ISO untuk createdAt dan updatedAt
  const now = new Date().toISOString()

  // Insert data role awal ke dalam tabel roles
  // Keempat role ini adalah role sistem bawaan yang tidak bisa dihapus (isSystem: 1)
  await db.insert(schema.roles).values([
    {
      // ID unik untuk role admin, di-generate secara acak
      id: randomUUID(),
      // Kode role admin dengan akses manajemen penuh
      code: 'admin',
      // Nama role admin
      name: 'Admin',
      // Deskripsi tanggung jawab role admin
      description: 'Manajemen aplikasi dan data referensi',
      // Menandakan ini adalah role sistem bawaan (tidak bisa dihapus)
      isSystem: 1,
      // Timestamp pembuatan record
      createdAt: now,
      // Timestamp pembaruan record
      updatedAt: now,
    },
    {
      // ID unik untuk role kepala, di-generate secara acak
      id: randomUUID(),
      // Kode role kepala sebagai pemeriksa utama kegiatan
      code: 'kepala',
      // Nama role kepala
      name: 'Kepala',
      // Deskripsi tanggung jawab role kepala
      description: 'Pemeriksa utama kegiatan',
      // Menandakan ini adalah role sistem bawaan
      isSystem: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      // ID unik untuk role koordinator, di-generate secara acak
      id: randomUUID(),
      // Kode role koordinator wilayah
      code: 'koordinator',
      // Nama role koordinator wilayah
      name: 'Koordinator Wilayah',
      // Deskripsi tanggung jawab role koordinator
      description: 'Koordinator wilayah kerja',
      // Menandakan ini adalah role sistem bawaan
      isSystem: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      // ID unik untuk role anggota, di-generate secara acak
      id: randomUUID(),
      // Kode role anggota wilayah
      code: 'anggota',
      // Nama role anggota wilayah
      name: 'Anggota Wilayah',
      // Deskripsi tanggung jawab role anggota
      description: 'Anggota wilayah kerja',
      // Menandakan ini adalah role sistem bawaan
      isSystem: 1,
      createdAt: now,
      updatedAt: now,
    },
  ])

  // Log untuk menandai proses seeding role selesai
  console.log('Roles seeded.')

  // Membuat array kode region wilayah (I, II, III, IV, V) sesuai pembagian wilayah kerja
  const regionCodes = ['I', 'II', 'III', 'IV', 'V']
  // Memetakan setiap kode region menjadi object data region yang akan di-insert
  const regionValues = regionCodes.map((code) => ({
    // ID unik untuk setiap region, di-generate secara acak
    id: randomUUID(),
    // Kode wilayah (I, II, III, IV, V)
    code,
    // Nama wilayah dengan format "Wilayah X"
    name: `Wilayah ${code}`,
    // Deskripsi wilayah dengan format "Wilayah kerja X"
    description: `Wilayah kerja ${code}`,
    // Status aktif wilayah (1 = aktif)
    isActive: 1,
    // Timestamp pembuatan record
    createdAt: now,
    // Timestamp pembaruan record
    updatedAt: now,
    // deletedAt null karena semua wilayah masih aktif (belum dihapus)
    deletedAt: null,
  }))

  // Insert data region ke dalam tabel regions
  await db.insert(schema.regions).values(regionValues)
  // Log untuk menandai proses seeding region selesai
  console.log('Regions seeded.')

  // Fetch admin role ID untuk membuat user admin
  const [adminRole] = await db.select().from(schema.roles).where(schema.eq(schema.roles.code, 'admin'))
  if (!adminRole) throw new Error('Admin role not found')

  // Insert user admin default
  await db.insert(users).values({
    id: randomUUID(),
    roleId: adminRole.id,
    regionId: null, // Admin tidak terikat region
    name: 'Admin',
    email: 'admin@uptdtekkomdik.local',
    passwordHash: hashPassword('admin123'),
    position: 'Administrator',
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  })
  console.log('Admin user seeded.')

  // Log final untuk menandai proses seeding selesai seluruhnya
  console.log('Seeding complete.')
}

// Menjalankan fungsi utama dan menangani error jika terjadi kegagalan
// Jika error terjadi, mencetak error ke console dan mengakhiri proses dengan exit code 1
main().catch((err) => {
  // Mencetak error detail jika proses seeding gagal
  console.error(err)
  // Mengakhiri proses dengan kode error 1 untuk menandakan kegagalan
  process.exit(1)
})
