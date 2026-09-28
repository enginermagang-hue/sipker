<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

// Mengambil state user, fungsi logout, dan fetchMe dari composable useAuth
const { user, logout, fetchMe } = useAuth()

// State untuk mengontrol keterbukaan sidebar sidebar
const open = ref(true)
const collapsed = ref(false)

// Saat komponen dimuat, jika user belum ada, mengambil data user
onMounted(() => {
  if (!user.value) fetchMe()
})

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
const route = useRoute()

// Computed untuk menghasilkan URL avatar berdasarkan nama pengguna
const avatarUrl = computed(() => user.value
  ? `https://api.dicebear.com/10.x/initials/svg?seed=${encodeURIComponent(user.value.name || '')}`
  : '')

// Computed untuk item dropdown menu pengguna di footer sidebar
const userItems = computed(() => [[
  { label: user.value?.name ?? '', description: user.value?.email, type: 'label' as const, class: 'font-semibold', avatar: { src: avatarUrl.value, alt: user.value?.name } },
  { type: 'separator' as const },
  { label: 'Keluar', icon: 'i-lucide-log-out', onSelect: () => logout() }
]])

// Tahun berjalan untuk ditampilkan di footer
const currentYear = new Date().getFullYear()
</script>

<template>
  <!-- Group dashboard yang berisi sidebar dan panel utama -->
  <UDashboardGroup storage storage-key="sipker-sidebar" unit="rem">
    <!-- Sidebar navigasi dengan fitur collapsible dan resizable -->
    <UDashboardSidebar
      v-model:open="open"
      v-model:collapsed="collapsed"
      collapsible resizable
      :min-size="14" :default-size="16" :max-size="22"
      :ui="{ body: 'custom-scrollbar-sidebar', footer: 'border-t border-default' }"
    >
      <!-- Header sidebar dengan ikon dan judul aplikasi -->
      <template #header="{ collapsed: c }">
        <div class="flex items-center gap-3 w-full">
          <UIcon name="i-lucide-clipboard-list" class="size-8 shrink-0 text-primary" />
          <span v-if="!c" class="font-bold text-sm truncate">{{ config.public.appName || 'SI Kinerja' }}</span>
        </div>
      </template>

      <!-- Konten default sidebar dengan menu navigasi utama dan menu bawah -->
      <template #default="{ collapsed: c }">
        <UNavigationMenu :collapsed="c" :items="mainGroups" orientation="vertical" />
        <UNavigationMenu :collapsed="c" :items="bottomGroups" orientation="vertical" class="mt-auto" />
      </template>

      <!-- Footer sidebar dengan dropdown menu pengguna -->
      <template #footer="{ collapsed: c }">
        <UDropdownMenu v-if="user" :items="userItems" :content="{ align: c ? 'center' : 'end', side: 'top', collisionPadding: 12 }" :ui="{ content: 'min-w-52' }">
          <UButton color="neutral" variant="ghost" block :square="c" class="data-[state=open]:bg-elevated justify-start" aria-label="Menu pengguna">
            <!-- Avatar pengguna -->
            <template #leading><UAvatar :src="avatarUrl" :alt="user.name" size="2xs" /></template>
            <!-- Nama pengguna -->
            <span v-if="!c" class="truncate text-left flex-1">{{ user.name }}</span>
            <!-- Ikon collapse -->
            <template v-if="!c" #trailing><UIcon name="i-lucide-chevrons-up-down" class="text-muted ms-auto" /></template>
          </UButton>
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <!-- Panel utama konten aplikasi -->
    <UDashboardPanel id="main" :ui="{ body: 'flex flex-col custom-scrollbar-main' }">
      <!-- Header panel dengan navbar -->
      <template #header>
        <UDashboardNavbar :title="String(route.meta.title || 'Dashboard')" :ui="{ right: 'gap-3' }">
          <!-- Tombol collapse sidebar -->
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
          <!-- Tombol mode warna -->
          <template #right>
            <UColorModeButton />
          </template>
        </UDashboardNavbar>
      </template>

      <!-- Body panel dengan slot konten dan footer -->
      <template #body>
        <div class="flex flex-col min-h-[calc(100vh-64px)]">
          <div class="p-0 flex-1">
            <!-- Slot untuk konten halaman -->
            <slot />
          </div>
          <!-- Footer aplikasi dengan copyright -->
          <footer class="shrink-0 border-t border-default bg-default px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted mt-auto">
            <div>© {{ currentYear }} {{ config.public.appName || 'SI Kinerja' }}</div>
            <div class="flex items-center gap-2">
              <span>Sistem Informasi Kegiatan Pelayanan Dapodik</span>
            </div>
          </footer>
        </div>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
