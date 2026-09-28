export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for login page
  if (to.path === '/login') return

  // Check session via cookie
  const cookie = useCookie('sid')
  if (!cookie.value) {
    return navigateTo('/login')
  }

  try {
    const res = await $fetch('/api/auth/me', { headers: { cookie: `sid=${cookie.value}` } })
    if (!res) return navigateTo('/login')
  } catch {
    return navigateTo('/login')
  }
})