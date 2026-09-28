// Composable untuk manajemen dashboard — menyediakan state dan keyboard shortcuts
import { createSharedComposable } from '@vueuse/core'

const _useDashboard = () => {
  // Mengambil informasi rute dan router untuk navigasi programatik
  const route = useRoute()
  const router = useRouter()

  // State untuk mengontrol keterbukaan slideover notifikasi
  const isNotificationsSlideoverOpen = ref(false)

  // Mendefinisikan pintasan keyboard untuk navigasi cepat
  // 'g-h': ke halaman Beranda, 'g-i': ke Inbox, 'g-c': ke Customers, 'g-s': ke Settings
  defineShortcuts({
    'g-h': () => router.push('/'),
    'g-i': () => router.push('/inbox'),
    'g-c': () => router.push('/customers'),
    'g-s': () => router.push('/settings'),
  })

  return {}
}

// Membuat composable yang dibagikan di seluruh komponen
export const useDashboard = createSharedComposable(_useDashboard)
