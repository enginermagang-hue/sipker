// Composable untuk manajemen autentikasi pengguna
// Menyediakan state user, status loading, dan fungsi login, logout, serta fetchMe
export const useAuth = () => {
  // State untuk menyimpan data pengguna yang sudah login (persisted di state)
  const user = useState<any>('auth-user', () => null)
  // State untuk melacak apakah data pengguna sudah dimuat
  const loaded = useState('auth-loaded', () => false)

  // Fungsi untuk mengambil data pengguna saat ini dari API
  // Mengirim cookie request header untuk verifikasi sesi
  // Return: Promise yang resolve ke user value
  async function fetchMe() {
    try {
      // Mengirim permintaan ke endpoint auth/me dengan cookie
      const res: any = await $fetch('/api/auth/me', {
        headers: useRequestHeaders(['cookie']) as Record<string, string>
      })
      // Menyimpan data pengguna ke state
      user.value = res
    } catch {
      // Jika gagal (sesi tidak valid), mengosongkan user state
      user.value = null
    }
    // Menandakan bahwa proses loading selesai
    loaded.value = true
    return user.value
  }

  // Fungsi untuk melakukan login pengguna
  // Parameter: email - alamat email pengguna
  //            password - kata sandi pengguna
  // Return: Promise yang resolve ke response dari API
  async function login(email: string, password: string) {
    // Mengirim permintaan POST ke endpoint auth/login dengan email dan password
    const res: any = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    // Menyimpan data pengguna ke state setelah login berhasil
    user.value = res
    return res
  }

  // Fungsi untuk melakukan logout pengguna
  // Mengirim permintaan POST ke endpoint auth/logout dan mengosongkan state user
  async function logout() {
    try {
      // Mengirim permintaan POST untuk logout
      await $fetch('/api/auth/logout', { method: 'POST' })
      // Mengosongkan state user
      user.value = null
      // Mengarahkan ke halaman login
      await navigateTo('/login')
    } catch {
      // Jika terjadi kesalahan saat logout, menampilkan toast error
      const toast = useToast()
      toast.add({ color: 'error', title: 'Gagal keluar', description: 'Terjadi kesalahan, coba lagi.' })
    }
  }

  // Mengembalikan semua state dan fungsi yang tersedia untuk digunakan oleh komponen
  return { user, loaded, fetchMe, login, logout }
}
