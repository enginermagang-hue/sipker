<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// Mengambil informasi rute saat ini
const route = useRoute()
// Mengambil fungsi toast untuk menampilkan notifikasi
const toast = useToast()

// Mengambil mode warna (light/dark) untuk tema aplikasi
const colorMode = useColorMode()

// State untuk mengontrol keterbukaan sidebar
const open = ref(false)
// State untuk mengontrol apakah sidebar dalam kondisi collapsed
const collapsed = ref(false)

// Mengambil state user, fungsi logout, dan fetchMe dari composable useAuth
const { user, logout, fetchMe } = useAuth()

// Mendefinisikan item menu navigasi sidebar — dibagi menjadi dua kelompok
const links = [[{
  label: 'Beranda',
  icon: 'i-lucide-layout-dashboard',
  to: '/',
  // Callback saat item dipilih — menutup sidebar
  onSelect: () => { open.value = false }
}, {
  label: 'Aktivitas',
  icon: 'i-lucide-list',
  to: '/admin/activities',
  onSelect: () => { open.value = false }
}, {
  label: 'Wilayah',
  icon: 'i-lucide-map',
  to: '/admin/regions',
  onSelect: () => { open.value = false }
}, {
  label: 'Pengaturan',
  icon: 'i-lucide-settings',
  to: '/admin/settings',
  defaultOpen: true,
  type: 'trigger',
  // Sub-menu anak untuk pengaturan
  children: [{
    label: 'Umum',
    to: '/admin/settings',
    exact: true,
    onSelect: () => { open.value = false }
  }, {
    label: 'Pengguna',
    to: '/admin/settings/users',
    onSelect: () => { open.value = false }
  }]
}], [{
  label: 'Bantuan',
  icon: 'i-lucide-info',
  // Link eksternal ke GitHub repository
  to: 'https://github.com/nuxt-ui-templates/dashboard',
  target: '_blank'
}]] satisfies NavigationMenuItem[][]

// Menghasilkan kelompok item pencarian untuk UDashboardSearch
const groups = computed(() => [{
  id: 'links',
  label: 'Navigasi',
  // Flatten array links untuk ditampilkan di search
  items: links.flat()
}, {
  id: 'code',
  label: 'Informasi',
  items: [{
    id: 'source',
    label: 'Tentang Aplikasi',
    icon: 'i-simple-icons-github',
    to: 'https://github.com/nuxt-ui-templates/dashboard',
    target: '_blank'
  }]
}])

// Computed yang menghasilkan menu navigasi utama berdasarkan peran pengguna
// Role admin melihat semua menu, kepala hanya melihat menu laporan
const mainGroups = computed<NavigationMenuItem[][]>(() => {
  const role = user.value?.roleCode

  // Menu umum yang terlihat oleh semua peran
  const umum: NavigationMenuItem[] = [
    { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/' },
    { label: 'Aktivitas', icon: 'i-lucide-list', to: '/admin/activities' }
  ]

  // Menu administrasi yang hanya terlihat oleh admin
  const administrasi: NavigationMenuItem[] = [
    { label: 'Administrasi', type: 'label' as const },
    { label: 'Wilayah', icon: 'i-lucide-map', to: '/admin/regions' },
    { label: 'Sekolah', icon: 'i-lucide-school' },
    { label: 'Kategori', icon: 'i-lucide-tags' },
    { label: 'Pengguna', icon: 'i-lucide-users' },
    { label: 'Audit Log', icon: 'i-lucide-scroll-text' }
  ]

  // Menu laporan untuk admin dan kepala
  const laporan: NavigationMenuItem[] = [
    { label: 'Laporan', type: 'label' as const },
    { label: 'Perlu Dicek', icon: 'i-lucide-clock' },
    { label: 'Laporan', icon: 'i-lucide-file-bar-chart' }
  ]

  // Menggabungkan group menu berdasarkan peran pengguna
  const groups: NavigationMenuItem[][] = [umum]

  if (role === 'admin') {
    groups.push(administrasi, laporan)
  } else if (role === 'kepala') {
    groups.push(laporan)
  }

  return groups
})

// Computed untuk menu navigasi di bagian bawah sidebar
const bottomGroups = computed<NavigationMenuItem[][]>(() => [[
  { label: 'Pengaturan', icon: 'i-lucide-settings' }
]])

// Mengambil konfigurasi aplikasi dan runtime config
const appConfig = useAppConfig()
const config = useRuntimeConfig()

// Computed untuk menghasilkan URL avatar berdasarkan nama pengguna via DiceBear API
const avatarUrl = computed(() => user.value
  ? `https://api.dicebear.com/10.x/initials/svg?seed=${encodeURIComponent(user.value.name || '')}`
  : '')

// Computed untuk item dropdown menu pengguna di footer sidebar
const userItems = computed(() => [[
  // Label nama dan email pengguna
  { label: user.value?.name ?? '', description: user.value?.email, type: 'label' as const, class: 'font-semibold', avatar: { src: avatarUrl.value, alt: user.value?.name } },
  { type: 'separator' as const },
  // Item logout yang memanggil fungsi logout dari useAuth
  { label: 'Keluar', icon: 'i-lucide-log-out', onSelect: () => logout() }
]])

// Tahun berjalan untuk ditampilkan di footer
const currentYear = new Date().getFullYear()

// Saat komponen dimuat, cek cookie consent dan tampilkan toast jika belum diterima
onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  // Jika cookie sudah diterima, tidak perlu menampilkan toast
  if (cookie.value === 'accepted') {
    return
  }

  // Menampilkan toast cookie consent dengan opsi terima atau tolak
  toast.add({
    title: 'Kami menggunakan cookie untuk meningkatkan pengalaman Anda.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Terima',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: 'Tolak',
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <!-- Group dashboard yang berisi sidebar dan panel utama dengan persistensi state -->
  <UDashboardGroup storage storage-key="sipker-sidebar" unit="rem">
    <!-- Sidebar navigasi dengan fitur collapsible dan resizable -->
    <UDashboardSidebar
      v-model:open="open"
      v-model:collapsed="collapsed"
      collapsible resizable
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <!-- Header sidebar berisi tombol pencarian (UDashboardSearchButton) -->
      <template #header="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />
      </template>

      <!-- Konten default sidebar dengan menu navigasi utama dan menu bawah -->
      <template #default="{ collapsed }">
        <!-- Menu navigasi utama berdasarkan peran pengguna -->
        <UNavigationMenu
          :collapsed="collapsed"
          :items="mainGroups"
          orientation="vertical"
          tooltip
          popover
        />

        <!-- Menu navigasi di bagian bawah sidebar (Pengaturan) -->
        <UNavigationMenu
          :collapsed="collapsed"
          :items="bottomGroups"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <!-- Footer sidebar dengan dropdown menu pengguna -->
      <template #footer="{ collapsed }">
        <UDropdownMenu v-if="user" :items="userItems" :content="{ align: collapsed ? 'center' : 'end', side: 'top', collisionPadding: 12 }" :ui="{ content: 'min-w-52' }">
          <UButton color="neutral" variant="ghost" block :square="collapsed" class="data-[state=open]:bg-elevated justify-start" aria-label="Menu pengguna">
            <!-- Avatar pengguna dari DiceBear API -->
            <template #leading><UAvatar :src="avatarUrl" :alt="user.name" size="2xs" /></template>
            <!-- Nama pengguna -->
            <span v-if="!collapsed" class="truncate text-left flex-1">{{ user.name }}</span>
            <!-- Ikon collapse -->
            <template v-if="!collapsed" #trailing><UIcon name="i-lucide-chevrons-up-down" class="text-muted ms-auto" /></template>
          </UButton>
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <!-- Komponen pencarian global untuk menemukan navigasi dan informasi -->
    <UDashboardSearch :groups="groups" />

    <!-- Slot untuk konten halaman -->
    <slot />

  </UDashboardGroup>
</template>
