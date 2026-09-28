import { and, eq, isNull } from 'drizzle-orm'
import { createDb } from '#server/database/index'
import { regions } from '#server/database/schema'
import { requireAuth } from '#server/utils/session'
import { requireRole } from '#server/utils/authz'

// Handler PATCH /api/admin/regions/:id — memperbarui sebagian data region berdasarkan ID, hanya jika belum dihapus
// Parameter: event (request HTTP) — id dari router parameter, body berisi field yang ingin diperbarui (code, name, description, isActive)
// Return: { data: Region } — region yang sudah diperbarui
// Throws: 400 jika code atau name kosong setelah trim, 404 jika region tidak ditemukan atau sudah dihapus
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) // mengautentikasi pengguna dari session
  requireRole(user, 'admin') // memastikan pengguna memiliki peran admin
  const id = getRouterParam(event, 'id')! // mengambil parameter ID dari URL route
  const body = await readBody(event) // membaca body dari request
  const db = createDb() // membuat koneksi database

  // Memproses setiap field dari body: hanya memperbarui jika field ada di body, dengan validasi trim dan uppercase untuk code
  const code = body.code !== undefined ? String(body.code).trim().toUpperCase() : undefined
  const name = body.name !== undefined ? String(body.name).trim() : undefined
  const description = body.description !== undefined ? (body.description ? String(body.description).trim() : null) : undefined
  const isActive = body.isActive !== undefined ? (body.isActive ? 1 : 0) : undefined

  // Validasi: code dan name tidak boleh kosong setelah trim jika disediakan
  if (code !== undefined && !code) throw createError({ statusCode: 400, statusMessage: 'Code is required' })
  if (name !== undefined && !name) throw createError({ statusCode: 400, statusMessage: 'Name is required' })

  // Update region: hanya memperbarui field yang disediakan di body, memperbarui updatedAt dengan timestamp saat ini
  // Query: memperbarui berdasarkan ID dan memastikan deletedAt null (belum dihapus)
  const [row] = await db
    .update(regions)
    .set({
      ...(code !== undefined && { code }), // menyertakan code hanya jika ada di body
      ...(name !== undefined && { name }), // menyertakan name hanya jika ada di body
      ...(description !== undefined && { description }), // menyertakan description hanya jika ada di body
      ...(isActive !== undefined && { isActive }), // menyertakan isActive hanya jika ada di body
      updatedAt: new Date().toISOString(), // timestamp pembaruan
    })
    .where(and(eq(regions.id, id), isNull(regions.deletedAt))) // kondisi: ID cocok dan belum dihapus
    .returning() // mengembalikan data row yang sudah diperbarui

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Region not found' }) // melempar error 404 jika region tidak ditemukan
  return { data: row } // mengembalikan region yang sudah diperbarui dalam format response
})
