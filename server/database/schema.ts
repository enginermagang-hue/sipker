import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const roles = sqliteTable(
  'roles',
  {
    id: text().primaryKey(),
    code: text().notNull().unique(),
    name: text().notNull(),
    description: text(),
    isSystem: integer('is_system').notNull().default(1),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex('idx_roles_code').on(table.code),
  })
)

export const regions = sqliteTable(
  'regions',
  {
    id: text().primaryKey(),
    code: text().notNull().unique(),
    name: text().notNull(),
    description: text(),
    isActive: integer('is_active').notNull().default(1),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    codeIdx: uniqueIndex('idx_regions_code').on(table.code),
    activeIdx: index('idx_regions_active').on(table.isActive),
  })
)

export const users = sqliteTable(
  'users',
  {
    id: text().primaryKey(),
    roleId: text('role_id').notNull().references(() => roles.id),
    regionId: text('region_id').references(() => regions.id),
    name: text().notNull(),
    email: text().notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    position: text(),
    phone: text(),
    isActive: integer('is_active').notNull().default(1),
    lastLoginAt: text('last_login_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    emailIdx: uniqueIndex('idx_users_email').on(table.email),
    regionActiveIdx: index('idx_users_region_active').on(table.regionId, table.isActive),
  })
)

export const schools = sqliteTable(
  'schools',
  {
    id: text().primaryKey(),
    regionId: text('region_id').notNull().references(() => regions.id),
    name: text().notNull(),
    npsn: text(),
    address: text(),
    isActive: integer('is_active').notNull().default(1),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    regionNameIdx: uniqueIndex('idx_schools_region_name').on(table.regionId, table.name),
    npsnIdx: uniqueIndex('idx_schools_npsn').on(table.npsn),
  })
)

export const activityCategories = sqliteTable(
  'activity_categories',
  {
    id: text().primaryKey(),
    code: text().notNull().unique(),
    name: text().notNull(),
    description: text(),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: integer('is_active').notNull().default(1),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    codeIdx: uniqueIndex('idx_activity_categories_code').on(table.code),
  })
)

export const activities = sqliteTable(
  'activities',
  {
    id: text().primaryKey(),
    createdBy: text('created_by').notNull().references(() => users.id),
    regionId: text('region_id').notNull().references(() => regions.id),
    schoolId: text('school_id').notNull().references(() => schools.id),
    categoryId: text('category_id').notNull().references(() => activityCategories.id),
    activityAt: text('activity_at').notNull(),
    consultantName: text('consultant_name').notNull(),
    consultantPosition: text('consultant_position'),
    consultantNip: text('consultant_nip'),
    topic: text().notNull(),
    actionTaken: text('action_taken').notNull(),
    result: text().notNull(),
    followUp: text('follow_up'),
    notes: text(),
    status: text().notNull().default('draft'),
    submittedAt: text('submitted_at'),
    checkedAt: text('checked_at'),
    checkedBy: text('checked_by').references(() => users.id),
    reviewNote: text('review_note'),
    version: integer().notNull().default(1),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    regionDateIdx: index('idx_activities_region_date').on(table.regionId, table.activityAt),
    statusSubmittedIdx: index('idx_activities_status_submitted').on(table.status, table.submittedAt),
    creatorDateIdx: index('idx_activities_creator_date').on(table.createdBy, table.activityAt),
    schoolDateIdx: index('idx_activities_school_date').on(table.schoolId, table.activityAt),
    categoryDateIdx: index('idx_activities_category_date').on(table.categoryId, table.activityAt),
    consultantIdx: index('idx_activities_consultant').on(table.consultantName),
  })
)

export const evidence = sqliteTable(
  'evidence',
  {
    id: text().primaryKey(),
    activityId: text('activity_id').notNull().references(() => activities.id),
    storageProvider: text('storage_provider').notNull().default('google_drive'),
    driveFileId: text('drive_file_id'),
    fileName: text('file_name').notNull(),
    originalName: text('original_name').notNull(),
    mimeType: text('mime_type').notNull(),
    fileSize: integer('file_size').notNull().default(0),
    status: text().notNull().default('uploading'),
    uploadedBy: text('uploaded_by').notNull().references(() => users.id),
    uploadedAt: text('uploaded_at'),
    errorMessage: text('error_message'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    activityIdx: index('idx_evidence_activity').on(table.activityId),
    driveFileIdx: uniqueIndex('idx_evidence_drive_file_id').on(table.driveFileId),
  })
)

export const activityReviews = sqliteTable(
  'activity_reviews',
  {
    id: text().primaryKey(),
    activityId: text('activity_id').notNull().references(() => activities.id),
    reviewerId: text('reviewer_id').notNull().references(() => users.id),
    action: text().notNull(),
    fromStatus: text('from_status').notNull(),
    toStatus: text('to_status').notNull(),
    note: text(),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    activityCreatedIdx: index('idx_reviews_activity_created').on(table.activityId, table.createdAt),
  })
)

export const sessions = sqliteTable(
  'sessions',
  {
    id: text().primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: text('expires_at').notNull(),
    lastUsedAt: text('last_used_at'),
    revokedAt: text('revoked_at'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    tokenHashIdx: index('idx_sessions_token').on(table.tokenHash),
    expiryIdx: index('idx_sessions_expiry').on(table.expiresAt),
  })
)

export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: text().primaryKey(),
    actorId: text('actor_id').references(() => users.id),
    actorRoleCode: text('actor_role_code'),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    action: text().notNull(),
    beforeJson: text('before_json'),
    afterJson: text('after_json'),
    ipAddress: text('ip_address'),
    requestId: text('request_id'),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    entityCreatedIdx: index('idx_audit_entity_created').on(table.entityType, table.entityId, table.createdAt),
    actorCreatedIdx: index('idx_audit_actor_created').on(table.actorId, table.createdAt),
  })
)

export const appSettings = sqliteTable(
  'app_settings',
  {
    settingKey: text('setting_key').primaryKey(),
    settingValue: text('setting_value').notNull(),
    valueType: text('value_type').notNull(),
    description: text(),
    updatedBy: text('updated_by').references(() => users.id),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  }
)
