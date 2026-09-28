import { getCurrentUser } from '#server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleCode: user.roleCode,
    regionId: user.regionId,
  }
})