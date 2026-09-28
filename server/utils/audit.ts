import { randomBytes } from 'node:crypto'
import { createDb } from '#server/database/index'
import { auditLogs } from '#server/database/schema'
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
  await db.insert(auditLogs).values({
    id: randomBytes(16).toString('hex'),
    actorId: actor?.id ?? null,
    actorRoleCode: actor?.roleCode ?? null,
    entityType,
    entityId,
    action,
    beforeJson: beforeJson ? JSON.stringify(beforeJson) : null,
    afterJson: afterJson ? JSON.stringify(afterJson) : null,
    ipAddress: event ? getHeader(event, 'x-forwarded-for') || '' : null,
    requestId: event ? getHeader(event, 'x-request-id') || null : null,
    createdAt: new Date().toISOString(),
  })
}