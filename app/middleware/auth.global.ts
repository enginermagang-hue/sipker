export default defineNuxtRouteMiddleware(async (to) => {
  // Mengambil state user, status loaded, dan fungsi fetchMe dari composable useAuth
  const { user, loaded, fetchMe } = useAuth()
  // Jika user belum dimuat, menjalankan fetchMe untuk mengambil data pengguna
  if (!loaded.value) await fetchMe()

  // Daftar halaman publik yang bisa diakses tanpa autentikasi
  const publicPages = ['/login', '/']
  // Memeriksa apakah halaman saat ini adalah halaman publik
  const isPublic = publicPages.includes(to.path)

  // Jika pengguna tidak login dan bukan halaman publik, mengarahkan ke halaman login
  if (!user.value && !isPublic) {
    return navigateTo('/login')
  }

  // Jika pengguna sudah login dan mencoba mengakses halaman login atau beranda,
  // mengarahkan ke dashboard yang sesuai berdasarkan peran
  if (user.value && (to.path === '/login' || to.path === '/')) {
    // Jika pengguna adalah admin, mengarahkan ke halaman admin
    if (user.value.roleCode === 'admin') return navigateTo('/admin')
    // Jika bukan admin, mengarahkan ke halaman kegiatan
    return navigateTo('/admin/activities')
  }
})
