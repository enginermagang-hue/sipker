<template>
  <!-- Layout utama aplikasi dengan container full-height -->
  <div class="min-h-screen bg-gray-50">
    <!-- Komponen anunciator rute untuk aksesibilitas -->
    <NuxtRouteAnnouncer />
    <!-- Layout default yang membungkus halaman -->
    <NuxtLayout>
      <!-- Komponen halaman yang dirender berdasarkan rute -->
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
