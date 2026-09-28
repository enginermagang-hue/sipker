import { randomBytes } from 'node:crypto'
import { and, eq, isNull } from 'drizzle-orm'
import { getAccessToken } from '#server/utils/google'
import { uploadFile } from '#server/utils/drive'
import { createDb } from '#server/database/index'
import { activities, evidence } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'
import { writeAudit } from '#server/utils/audit'

// ID folder Google Drive dari environment variable
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID
// Ukuran maksimum file upload (default 10MB)
const MAX_SIZE = Number(process.env.UPLOAD_MAX_SIZE || 10485760)

// Handler utama untuk endpoint POST /api/activities/:id/evidence
// Mengunggah bukti (evidence) berupa file ke Google Drive dan menyimpan metadata di database
// Hanya pembuat aktivitas, admin, atau kepala yang bisa mengunggah bukti
// Parameter: id dari URL router, multipart form data berisi file
// Return: { data: metadata bukti yang telah diunggah }
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!

  const db = createDb()
  // Cari aktivitas yang ada dan belum dihapus
  const [activity] = await db.select().from(activities).where(and(eq(activities.id, id), isNull(activities.deletedAt))).limit(1)
  if (!activity) throw createError({ statusCode: 404, statusMessage: 'Activity not found' })

  // Authorization: pembuat aktivitas, admin, atau kepala bisa mengunggah bukti
  if (activity.createdBy !== user.id && user.roleCode !== 'admin' && user.roleCode !== 'kepala') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  // Baca data multipart form dari request
  const body = await readMultipartFormData(event)
  if (!body || body.length === 0) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })

  // Validasi file bagian pertama
  const filePart = body[0]
  if (!filePart || !filePart.data || filePart.data.byteLength === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Empty file' })
  }
  // Validasi ukuran file tidak melebihi batas maksimum
  if (filePart.data.byteLength > MAX_SIZE) {
    throw createError({ statusCode: 413, statusMessage: 'File too large' })
  }

  // Buat objek File dari data yang diunggah
  const file = new File([filePart.data], filePart.filename || 'upload', { type: filePart.type || 'application/octet-stream' })
  // Unggah file ke Google Drive
  const stored = await uploadFile(file, file.name)
  const now = new Date().toISOString()

  // Simpan metadata bukti ke database
  const [ev] = await db
    .insert(evidence)
    .values({
      id: randomBytes(16).toString('hex'), // ID unik acak
      activityId: activity.id,
      storageProvider: 'google_drive', // Penyimpanan menggunakan Google Drive
      driveFileId: stored.id, // ID file di Google Drive
      fileName: stored.name, // Nama file di storage
      originalName: file.name, // Nama asli file yang diunggah
      mimeType: stored.mimeType, // Tipe MIME file
      fileSize: stored.size, // Ukuran file
      status: 'available', // Status bukti tersedia
      uploadedBy: user.id,
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  // Catat audit trail untuk pengunggahan bukti
  await writeAudit(user, 'evidence', ev.id, 'create', null, ev, event)
  return { data: ev }
})