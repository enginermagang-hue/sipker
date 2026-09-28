export default defineNuxtRouteMiddleware(async (to) => {
  // Mengambil state user, status loaded, dan fungsi fetchMe dari composable useAuth
  const { user, loaded, fetchMe } = useAuth()
  // Jika user belum dimuat, menjalankan fetchMe untuk mengambil data pengguna
  if (!loaded.value) await fetchMe()

  // Jika pengguna tidak login, mengarahkan ke halaman login
  if (!user.value) {
    return navigateTo('/login')
  }

  // Jika pengguna bukan admin, mengarahkan ke halaman kegiatan (akses ditolak)
  if (user.value.roleCode !== 'admin') {
    return navigateTo('/admin/activities')
  }
})
