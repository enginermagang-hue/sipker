<script setup lang="ts">
// Mengambil mode warna (light/dark) untuk konfigurasi theme-color
const colorMode = useColorMode()

// Menghitung nilai warna berdasarkan mode — gelap untuk background #1b1718, terang untuk white
const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

// Mengatur meta tag untuk head dokumen HTML — charset, viewport, theme-color
useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    // Menambahkan favicon untuk tab browser
    { rel: 'icon', href: '/favicon.ico' }
  ],
  // Mengatur atribut bahasa HTML menjadi Indonesia
  htmlAttrs: {
    lang: 'id'
  }
})

// Judul halaman untuk SEO
const title = 'SI Kinerja'
// Deskripsi halaman untuk SEO dan Open Graph
const description = 'Sistem Informasi Kegiatan Pelayanan Dapodik UPTD Tekkomdik'

// Mengkonfigurasi metadata SEO (title, description, Open Graph, Twitter Card)
useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/dashboard-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <!-- Wrapper aplikasi utama menggunakan UApp dari Nuxt UI -->
  <UApp>
    <!-- Indikator loading halaman saat navigasi -->
    <NuxtLoadingIndicator />

    <!-- Layout default yang membungkus setiap halaman -->
    <NuxtLayout>
      <!-- Komponen halaman yang dirender berdasarkan rute aktif -->
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
