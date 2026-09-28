export default defineNuxtRouteMiddleware(async (to) => {
  // Melewatkan middleware untuk halaman login agar pengguna bisa mengaksesnya tanpa autentikasi
  if (to.path === '/login') return

  // Memeriksa sesi pengguna melalui cookie 'sid'
  const cookie = useCookie('sid')
  if (!cookie.value) {
    // Jika cookie tidak ada, mengarahkan pengguna ke halaman login
    return navigateTo('/login')
  }

  try {
    // Mengirim permintaan ke endpoint auth/me untuk memverifikasi sesi
    const res = await $fetch('/api/auth/me', { headers: { cookie: `sid=${cookie.value}` } })
    // Jika respons tidak valid, mengarahkan ke halaman login
    if (!res) return navigateTo('/login')
  } catch {
    // Jika terjadi kesalahan (sesi expired atau tidak valid), mengarahkan ke halaman login
    return navigateTo('/login')
  }
})
