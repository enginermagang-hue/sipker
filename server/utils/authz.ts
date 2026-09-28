export function requireRole(user: any, ...codes: string[]) {
  if (!codes.includes(user.roleCode)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: insufficient role' })
  }
}

// Koordinator/Anggota must have a region; Admin/Kepala may be global (regionId nullable)
export function requireRegionScope(user: any, regionId: string) {
  if (user.roleCode === 'admin' || user.roleCode === 'kepala') return
  if (!user.regionId) {
    throw createError({ statusCode: 403, statusMessage: 'User has no region scope' })
  }
  if (user.regionId !== regionId) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: region mismatch' })
  }
}