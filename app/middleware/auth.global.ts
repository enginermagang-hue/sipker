export default defineNuxtRouteMiddleware(async (to) => {
  const { user, loaded, fetchMe } = useAuth()
  if (!loaded.value) await fetchMe()

  const publicPages = ['/login']
  const isPublic = publicPages.includes(to.path)
  if (!user.value && !isPublic) {
    return navigateTo('/login')
  }
  if (user.value && to.path === '/login') {
    return navigateTo('/')
  }
})
