import { randomBytes } from 'node:crypto'
import { createDb } from '#server/database/index'
import { auditLogs } from '#server/database/schema'

// Mencatat log audit untuk aktivitas pengguna dan perubahan sistem
// Parameter: actor - objek pengguna yang melakukan aksi (dengan id dan roleCode opsional)
// Parameter: entityType - jenis entitas yang terdampak (misalnya: 'activity', 'user')
// Parameter: entityId - ID entitas spesifik yang terdampak
// Parameter: action - aksi yang dilakukan (misalnya: 'create', 'update', 'delete')
// Parameter: beforeJson - data sebelum perubahan (opsional, default null)
// Parameter: afterJson - data setelah perubahan (opsional, default null)
// Parameter: event - objek permintaan HTTP untuk mengambil metadata IP dan request ID (opsional)
// Return: Promise<void>
export async function writeAudit(
  actor: { id: string; roleCode?: string | null } | null,
  entityType: string,
  entityId: string,
  action: string,
  beforeJson: any = null,
  afterJson: any = null,
  event?: any
) {
  const db = createDb()

  // Sisipkan catatan log audit ke database dengan ID unik, data actor, entitas, aksi, dan metadata
  await db.insert(auditLogs).values({
    // Generate ID unik sepanjang 16 byte menggunakan crypto random
    id: randomBytes(16).toString('hex'),
    // ID actor (null jika actor tidak diketahui)
    actorId: actor?.id ?? null,
    // Kode peran actor (null jika tidak tersedia)
    actorRoleCode: actor?.roleCode ?? null,
    // Jenis entitas yang terdampak
    entityType,
    // ID entitas spesifik
    entityId,
    // Aksi yang dilakukan
    action,
    // Snapshot data sebelum perubahan (stringify jika ada)
    beforeJson: beforeJson ? JSON.stringify(beforeJson) : null,
    // Snapshot data setelah perubahan (stringify jika ada)
    afterJson: afterJson ? JSON.stringify(afterJson) : null,
    // Alamat IP pengguna dari header x-forwarded-for
    ipAddress: event ? getHeader(event, 'x-forwarded-for') || '' : null,
    // ID permintaan dari header x-request-id
    requestId: event ? getHeader(event, 'x-request-id') || null : null,
    // Waktu pencatatan log
    createdAt: new Date().toISOString(),
  })
}
