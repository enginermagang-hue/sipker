export const useAuth = () => {
  const user = useState<any>('auth-user', () => null)
  const loaded = useState('auth-loaded', () => false)

  async function fetchMe() {
    try {
      const res: any = await $fetch('/api/auth/me', {
        headers: useRequestHeaders(['cookie']) as Record<string, string>
      })
      user.value = res
    } catch {
      user.value = null
    }
    loaded.value = true
    return user.value
  }

  async function login(email: string, password: string) {
    const res: any = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    user.value = res
    return res
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
      await navigateTo('/login')
    } catch {
      const toast = useToast()
      toast.add({ color: 'error', title: 'Gagal keluar', description: 'Terjadi kesalahan, coba lagi.' })
    }
  }

  return { user, loaded, fetchMe, login, logout }
}
