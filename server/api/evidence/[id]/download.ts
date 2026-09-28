// Handler API untuk mengunduh bukti (evidence) berdasarkan ID — mengautentikasi pengguna, memverifikasi izin akses, dan mengambil file dari Google Drive
import { and, eq, isNull } from 'drizzle-orm'
import { getAccessToken } from '#server/utils/google'
import { downloadFile } from '#server/utils/drive'
import { createDb } from '#server/database/index'
import { evidence, activities } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { writeAudit } from '#server/utils/audit'

// Handler event Nuxt — menangani permintaan unduh evidence
// Parameter: event (objek permintaan HTTP berisi parameter router dan sesi pengguna)
// Return: blob file Google Drive yang diunduh
export default defineEventHandler(async (event) => {
  // Mengautentikasi pengguna dari sesi — melempar error jika tidak ada sesi yang valid
  const user = await requireAuth(event)

  // Mengambil parameter ID dari URL router — ID evidence yang akan diunduh
  const id = getRouterParam(event, 'id')!

  // Membuat koneksi database baru untuk query ini
  const db = createDb()

  // Query evidence berdasarkan ID yang diberikan, hanya yang belum dihapus (soft delete)
  // Mengembalikan array evidence yang ditemukan atau kosong jika tidak ada
  const [ev] = await db.select().from(evidence).where(and(eq(evidence.id, id), isNull(evidence.deletedAt))).limit(1)

  // Jika evidence tidak ditemukan, lempar error 404
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Evidence not found' })

  // Mengambil activity terkait berdasarkan activityId dari evidence
  // Untuk memverifikasi kepemilikan dan izin akses wilayah
  const [activity] = await db.select().from(activities).where(eq(activities.id, ev.activityId)).limit(1)

  // Jika activity tidak ditemukan, lempar error 404
  if (!activity) throw createError({ statusCode: 404, statusMessage: 'Activity not found' })

  // Pemeriksaan izin berdasarkan peran dan kepemilikan wilayah
  // Anggota hanya bisa mengunduh evidence dari activity yang mereka buat sendiri
  if (user.roleCode === 'anggota' && activity.createdBy !== user.id) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  // Koordinator hanya bisa mengunduh evidence dari activity di wilayah mereka sendiri
  if (user.roleCode === 'koordinator' && activity.regionId !== user.regionId) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  // Mengunduh file blob dari Google Drive menggunakan ID file Drive yang tersimpan di evidence
  const blob = await downloadFile(ev.driveFileId)

  // Mencatat audit trail — mencatat aksi download oleh pengguna untuk jejak audit
  await writeAudit(user, 'evidence', ev.id, 'download', null, { driveFileId: ev.driveFileId }, event)

  // Menetapkan header respons HTTP untuk unduhan file
  // Content-Type menentukan tipe MIME file (default: application/octet-stream jika tidak ada)
  setHeader(event, 'Content-Type', ev.mimeType || 'application/octet-stream')
  // Content-Length menunjukkan ukuran file dalam byte agar client tahu berapa data yang diunduh
  setHeader(event, 'Content-Length', String(blob.size))
  // Content-Disposition memaksa browser untuk menampilkan dialog simpan file dengan nama yang sesuai
  setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(ev.fileName || 'download')}"`)

  // Mengembalikan blob file sebagai respons HTTP untuk diunduh oleh client
  return blob
})
