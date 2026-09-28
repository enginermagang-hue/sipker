import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Tabel roles: menyimpan daftar peran/role pengguna dalam sistem
// Setiap role memiliki kode unik, nama, dan deskripsi
// isSystem menandakan apakah role tersebut adalah role sistem bawaan (1 = ya, 0 = tidak)
export const roles = sqliteTable(
  'roles',
  {
    // ID unik utama untuk setiap role
    id: text().primaryKey(),
    // Kode unik yang digunakan sebagai identifier role (misal: 'admin', 'kepala')
    code: text().notNull().unique(),
    // Nama lengkap dari role tersebut
    name: text().notNull(),
    // Deskripsi tentang tanggung jawab role ini
    description: text(),
    // Menandakan apakah role ini adalah role sistem bawaan (1 = system role, tidak bisa dihapus)
    isSystem: integer('is_system').notNull().default(1),
    // Timestamp kapan record role dibuat
    createdAt: text('created_at').notNull(),
    // Timestamp kapan record role terakhir diperbarui
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    // Index unik pada kolom code untuk memastikan tidak ada duplicate kode role
    codeIdx: uniqueIndex('idx_roles_code').on(table.code),
  })
)

// Tabel regions: menyimpan daftar wilayah kerja dalam organisasi
// Setiap wilayah memiliki kode, nama, dan status aktif
// Mendukung soft delete melalui kolom deletedAt
export const regions = sqliteTable(
  'regions',
  {
    // ID unik utama untuk setiap wilayah
    id: text().primaryKey(),
    // Kode unik wilayah (misal: 'I', 'II', 'III')
    code: text().notNull().unique(),
    // Nama wilayah
    name: text().notNull(),
    // Deskripsi tambahan tentang wilayah ini
    description: text(),
    // Status aktif wilayah (1 = aktif, 0 = tidak aktif)
    isActive: integer('is_active').notNull().default(1),
    // Timestamp kapan record wilayah dibuat
    createdAt: text('created_at').notNull(),
    // Timestamp kapan record wilayah terakhir diperbarui
    updatedAt: text('updated_at').notNull(),
    // Timestamp ketika wilayah dihapus (soft delete), null jika masih aktif
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    // Index unik pada kolom code untuk memastikan tidak ada duplicate kode wilayah
    codeIdx: uniqueIndex('idx_regions_code').on(table.code),
    // Index untuk pencarian wilayah berdasarkan status aktif
    activeIdx: index('idx_regions_active').on(table.isActive),
  })
)

// Tabel users: menyimpan data pengguna/pengguna aplikasi
// Setiap pengguna memiliki role, region, dan informasi login
// Mendukung soft delete dan mencatat last login
export const users = sqliteTable(
  'users',
  {
    // ID unik utama untuk setiap pengguna
    id: text().primaryKey(),
    // ID role pengguna, merujuk ke tabel roles (tidak bisa null)
    roleId: text('role_id').notNull().references(() => roles.id),
    // ID region tempat pengguna bertugas, merujuk ke tabel regions (bisa null untuk admin)
    regionId: text('region_id').references(() => regions.id),
    // Nama lengkap pengguna
    name: text().notNull(),
    // Email pengguna yang digunakan untuk login, harus unik
    email: text().notNull().unique(),
    // Hash password pengguna untuk autentikasi yang aman
    passwordHash: text('password_hash').notNull(),
    // Jabatan/posisi pengguna di organisasi
    position: text(),
    // Nomor telepon pengguna
    phone: text(),
    // Status aktif pengguna (1 = aktif, 0 = tidak aktif/nonaktif)
    isActive: integer('is_active').notNull().default(1),
    // Timestamp terakhir kali pengguna login
    lastLoginAt: text('last_login_at'),
    // Timestamp kapan record pengguna dibuat
    createdAt: text('created_at').notNull(),
    // Timestamp kapan record pengguna terakhir diperbarui
    updatedAt: text('updated_at').notNull(),
    // Timestamp ketika pengguna dihapus (soft delete), null jika masih aktif
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    // Index unik pada kolom email untuk memastikan tidak ada duplicate email
    emailIdx: uniqueIndex('idx_users_email').on(table.email),
    // Index komposit untuk pencarian pengguna berdasarkan region dan status aktif
    regionActiveIdx: index('idx_users_region_active').on(table.regionId, table.isActive),
  })
)

// Tabel schools: menyimpan data sekolah yang berada di bawah wilayah tertentu
// Setiap sekolah memiliki NPSN (nomor induk sekolah), alamat, dan status aktif
// Mendukung soft delete
export const schools = sqliteTable(
  'schools',
  {
    // ID unik utama untuk setiap sekolah
    id: text().primaryKey(),
    // ID region tempat sekolah berada, merujuk ke tabel regions (tidak bisa null)
    regionId: text('region_id').notNull().references(() => regions.id),
    // Nama sekolah
    name: text().notNull(),
    // NPSN (Nomor Pokok Sekolah Nasional) - identitas resmi sekolah
    npsn: text(),
    // Alamat fisik sekolah
    address: text(),
    // Status aktif sekolah (1 = aktif, 0 = tidak aktif)
    isActive: integer('is_active').notNull().default(1),
    // Timestamp kapan record sekolah dibuat
    createdAt: text('created_at').notNull(),
    // Timestamp kapan record sekolah terakhir diperbarui
    updatedAt: text('updated_at').notNull(),
    // Timestamp ketika sekolah dihapus (soft delete), null jika masih aktif
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    // Index unik untuk kombinasi region dan nama sekolah
    regionNameIdx: uniqueIndex('idx_schools_region_name').on(table.regionId, table.name),
    // Index unik pada NPSN untuk memastikan tidak ada duplicate NPSN
    npsnIdx: uniqueIndex('idx_schools_npsn').on(table.npsn),
  })
)

// Tabel activity_categories: menyimpan kategori kegiatan yang dapat dilakukan
// Setiap kategori memiliki kode, nama, dan urutan tampilan
// Mendukung soft delete
export const activityCategories = sqliteTable(
  'activity_categories',
  {
    // ID unik utama untuk setiap kategori kegiatan
    id: text().primaryKey(),
    // Kode unik kategori kegiatan
    code: text().notNull().unique(),
    // Nama kategori kegiatan
    name: text().notNull(),
    // Deskripsi dari kategori kegiatan ini
    description: text(),
    // Urutan tampilan kategori dalam daftar (untuk sorting)
    sortOrder: integer('sort_order').notNull().default(0),
    // Status aktif kategori (1 = aktif, 0 = tidak aktif)
    isActive: integer('is_active').notNull().default(1),
    // Timestamp kapan record kategori dibuat
    createdAt: text('created_at').notNull(),
    // Timestamp kapan record kategori terakhir diperbarui
    updatedAt: text('updated_at').notNull(),
    // Timestamp ketika kategori dihapus (soft delete), null jika masih aktif
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    // Index unik pada kolom code untuk memastikan tidak ada duplicate kode kategori
    codeIdx: uniqueIndex('idx_activity_categories_code').on(table.code),
  })
)

// Tabel activities: menyimpan catatan kegiatan yang dilakukan oleh konsultan/tenaga pendidik
// Setiap kegiatan terhubung ke pengguna, region, sekolah, dan kategori tertentu
// Mendukung alur status (draft, submitted, checked) dan versi
export const activities = sqliteTable(
  'activities',
  {
    // ID unik utama untuk setiap kegiatan
    id: text().primaryKey(),
    // ID pengguna yang membuat kegiatan ini, merujuk ke tabel users (tidak bisa null)
    createdBy: text('created_by').notNull().references(() => users.id),
    // ID wilayah tempat kegiatan dilakukan, merujuk ke tabel regions (tidak bisa null)
    regionId: text('region_id').notNull().references(() => regions.id),
    // ID sekolah tempat kegiatan dilakukan, merujuk ke tabel schools (tidak bisa null)
    schoolId: text('school_id').notNull().references(() => schools.id),
    // ID kategori kegiatan, merujuk ke tabel activityCategories (tidak bisa null)
    categoryId: text('category_id').notNull().references(() => activityCategories.id),
    // Tanggal dan waktu kegiatan dilaksanakan
    activityAt: text('activity_at').notNull(),
    // Nama konsultan/tenaga pendidik yang melakukan kegiatan
    consultantName: text('consultant_name').notNull(),
    // Jabatan/posisi konsultan
    consultantPosition: text('consultant_position'),
    // NIP (Nomor Induk Pegawai) konsultan
    consultantNip: text('consultant_nip'),
    // Topik atau tema dari kegiatan ini
    topic: text().notNull(),
    // Tindakan/tindakan yang dilakukan selama kegiatan
    actionTaken: text('action_taken').notNull(),
    // Hasil/hasil yang dicapai dari kegiatan
    result: text().notNull(),
    // Catatan tindak lanjut yang perlu dilakukan setelah kegiatan
    followUp: text('follow_up'),
    // Catatan tambahan atau keterangan lainnya
    notes: text(),
    // Status kegiatan: 'draft' (belum diajukan), 'submitted' (sudah diajukan), 'checked' (sudah diperiksa)
    status: text().notNull().default('draft'),
    // Timestamp ketika kegiatan diajukan (status berubah ke submitted)
    submittedAt: text('submitted_at'),
    // Timestamp ketika kegiatan diperiksa oleh kepala/koordinator
    checkedAt: text('checked_at'),
    // ID pengguna yang memeriksa/menyetujui kegiatan ini, merujuk ke tabel users
    checkedBy: text('checked_by').references(() => users.id),
    // Catatan tinjauan dari pemeriksa
    reviewNote: text('review_note'),
    // Versi record kegiatan (untuk tracking perubahan history)
    version: integer().notNull().default(1),
    // Timestamp kapan record kegiatan dibuat
    createdAt: text('created_at').notNull(),
    // Timestamp kapan record kegiatan terakhir diperbarui
    updatedAt: text('updated_at').notNull(),
    // Timestamp ketika kegiatan dihapus (soft delete), null jika masih aktif
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    // Index untuk pencarian kegiatan berdasarkan region dan tanggal kegiatan
    regionDateIdx: index('idx_activities_region_date').on(table.regionId, table.activityAt),
    // Index untuk pencarian kegiatan berdasarkan status dan tanggal pengajuan
    statusSubmittedIdx: index('idx_activities_status_submitted').on(table.status, table.submittedAt),
    // Index untuk pencarian kegiatan berdasarkan pembuat dan tanggal kegiatan
    creatorDateIdx: index('idx_activities_creator_date').on(table.createdBy, table.activityAt),
    // Index untuk pencarian kegiatan berdasarkan sekolah dan tanggal kegiatan
    schoolDateIdx: index('idx_activities_school_date').on(table.schoolId, table.activityAt),
    // Index untuk pencarian kegiatan berdasarkan kategori dan tanggal kegiatan
    categoryDateIdx: index('idx_activities_category_date').on(table.categoryId, table.activityAt),
    // Index untuk pencarian kegiatan berdasarkan nama konsultan
    consultantIdx: index('idx_activities_consultant').on(table.consultantName),
  })
)

// Tabel evidence: menyimpan bukti/file yang melampirkan setiap kegiatan
// File disimpan di Google Drive, metadata disimpan di database
// Mendukung status upload (uploading, uploaded, failed)
export const evidence = sqliteTable(
  'evidence',
  {
    // ID unik utama untuk setiap bukti/file
    id: text().primaryKey(),
    // ID kegiatan yang dilampiri bukti ini, merujuk ke tabel activities (tidak bisa null)
    activityId: text('activity_id').notNull().references(() => activities.id),
    // Penyedia penyimpanan file (default: 'google_drive')
    storageProvider: text('storage_provider').notNull().default('google_drive'),
    // ID file di Google Drive untuk mengidentifikasi file yang diunggah
    driveFileId: text('drive_file_id'),
    // Nama file yang tersimpan di storage
    fileName: text('file_name').notNull(),
    // Nama asli file sebelum diunggah
    originalName: text('original_name').notNull(),
    // MIME type file (misal: 'application/pdf', 'image/png')
    mimeType: text('mime_type').notNull(),
    // Ukuran file dalam byte
    fileSize: integer('file_size').notNull().default(0),
    // Status upload file: 'uploading' (sedang upload), 'uploaded' (selesai), 'failed' (gagal)
    status: text().notNull().default('uploading'),
    // ID pengguna yang mengunggah bukti ini, merujuk ke tabel users (tidak bisa null)
    uploadedBy: text('uploaded_by').notNull().references(() => users.id),
    // Timestamp ketika file diunggah
    uploadedAt: text('uploaded_at'),
    // Pesan error jika upload gagal
    errorMessage: text('error_message'),
    // Timestamp kapan record bukti dibuat
    createdAt: text('created_at').notNull(),
    // Timestamp kapan record bukti terakhir diperbarui
    updatedAt: text('updated_at').notNull(),
    // Timestamp ketika bukti dihapus (soft delete), null jika masih aktif
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    // Index untuk pencarian bukti berdasarkan ID kegiatan
    activityIdx: index('idx_evidence_activity').on(table.activityId),
    // Index unik pada driveFileId untuk memastikan tidak ada duplicate file ID
    driveFileIdx: uniqueIndex('idx_evidence_drive_file_id').on(table.driveFileId),
  })
)

// Tabel activity_reviews: menyimpan riwayat tinjauan/pemeriksaan kegiatan
// Setiap review mencatat perubahan status dari satu status ke status lainnya
// Digunakan untuk audit trail proses persetujuan kegiatan
export const activityReviews = sqliteTable(
  'activity_reviews',
  {
    // ID unik utama untuk setiap review
    id: text().primaryKey(),
    // ID kegiatan yang direview, merujuk ke tabel activities (tidak bisa null)
    activityId: text('activity_id').notNull().references(() => activities.id),
    // ID pengguna yang melakukan review, merujuk ke tabel users (tidak bisa null)
    reviewerId: text('reviewer_id').notNull().references(() => users.id),
    // Aksi yang dilakukan dalam review (misal: 'approve', 'reject', 'request_revision')
    action: text().notNull(),
    // Status kegiatan sebelum review dilakukan
    fromStatus: text('from_status').notNull(),
    // Status kegiatan setelah review dilakukan
    toStatus: text('to_status').notNull(),
    // Catatan atau komentar dari reviewer
    note: text(),
    // Timestamp kapan review dilakukan
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    // Index untuk pencarian review berdasarkan kegiatan dan tanggal pembuatan
    activityCreatedIdx: index('idx_reviews_activity_created').on(table.activityId, table.createdAt),
  })
)

// Tabel sessions: menyimpan sesi login aktif pengguna
// Digunakan untuk manajemen autentikasi dan tracking sesi pengguna
export const sessions = sqliteTable(
  'sessions',
  {
    // ID unik utama untuk setiap sesi
    id: text().primaryKey(),
    // ID pengguna yang memiliki sesi ini, merujuk ke tabel users (tidak bisa null)
    userId: text('user_id').notNull().references(() => users.id),
    // Hash token sesi untuk verifikasi autentikasi, harus unik
    tokenHash: text('token_hash').notNull().unique(),
    // Timestamp kapan sesi ini berakhir/hangus
    expiresAt: text('expires_at').notNull(),
    // Timestamp terakhir kali sesi digunakan
    lastUsedAt: text('last_used_at'),
    // Timestamp ketika sesi dicabut/dibatalkan secara manual
    revokedAt: text('revoked_at'),
    // Alamat IP dari mana sesi dibuat
    ipAddress: text('ip_address'),
    // User agent browser/perangkat yang digunakan untuk sesi ini
    userAgent: text('user_agent'),
    // Timestamp kapan sesi dibuat
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    // Index untuk pencarian sesi berdasarkan hash token
    tokenHashIdx: index('idx_sessions_token').on(table.tokenHash),
    // Index untuk pencarian sesi yang akan berakhir (untuk cleanup)
    expiryIdx: index('idx_sessions_expiry').on(table.expiresAt),
  })
)

// Tabel audit_logs: menyimpan log audit semua aktivitas penting dalam sistem
// Setiap log mencatat siapa, apa, kapan, dan apa yang berubah
// Digunakan untuk keamanan dan audit trail
export const auditLogs = sqliteTable(
  'audit_logs',
  {
    // ID unik utama untuk setiap entri audit log
    id: text().primaryKey(),
    // ID pengguna yang melakukan aksi, merujuk ke tabel users (bisa null jika sistem)
    actorId: text('actor_id').references(() => users.id),
    // Kode role pengguna yang melakukan aksi (untuk referensi tanpa join)
    actorRoleCode: text('actor_role_code'),
    // Tipe entitas yang dimodifikasi (misal: 'activity', 'user', 'school')
    entityType: text('entity_type').notNull(),
    // ID entitas yang dimodifikasi
    entityId: text('entity_id').notNull(),
    // Aksi yang dilakukan (misal: 'create', 'update', 'delete')
    action: text().notNull(),
    // Data JSON kondisi sebelum perubahan dilakukan
    beforeJson: text('before_json'),
    // Data JSON kondisi setelah perubahan dilakukan
    afterJson: text('after_json'),
    // Alamat IP dari mana aksi dilakukan
    ipAddress: text('ip_address'),
    // ID permintaan HTTP untuk korelasi log
    requestId: text('request_id'),
    // Timestamp kapan aksi audit dilakukan
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    // Index untuk pencarian audit log berdasarkan tipe entitas, ID entitas, dan tanggal
    entityCreatedIdx: index('idx_audit_entity_created').on(table.entityType, table.entityId, table.createdAt),
    // Index untuk pencarian audit log berdasarkan aktor dan tanggal
    actorCreatedIdx: index('idx_audit_actor_created').on(table.actorId, table.createdAt),
  })
)

// Tabel app_settings: menyimpan pengaturan konfigurasi aplikasi
// Setiap pengaturan memiliki key, value, dan tipe nilai
// Digunakan untuk menyimpan konfigurasi dinamis tanpa perlu mengubah kode
export const appSettings = sqliteTable(
  'app_settings',
  {
    // Key unik sebagai identifier pengaturan (primary key)
    settingKey: text('setting_key').primaryKey(),
    // Nilai dari pengaturan dalam bentuk string
    settingValue: text('setting_value').notNull(),
    // Tipe data dari nilai pengaturan (misal: 'string', 'number', 'boolean')
    valueType: text('value_type').notNull(),
    // Deskripsi tentang pengaturan ini
    description: text(),
    // ID pengguna yang terakhir memperbarui pengaturan ini, merujuk ke tabel users
    updatedBy: text('updated_by').references(() => users.id),
    // Timestamp kapan record pengaturan dibuat
    createdAt: text('created_at').notNull(),
    // Timestamp kapan record pengaturan terakhir diperbarui
    updatedAt: text('updated_at').notNull(),
  }
)
