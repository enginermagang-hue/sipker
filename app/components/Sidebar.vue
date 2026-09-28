<template>
  <aside class="w-64 bg-slate-900 text-white min-h-screen p-6">
    <div class="mb-8">
      <h2 class="text-xl font-bold">SI Kinerja</h2>
      <p class="text-xs text-slate-400">UPTD Tekkomdik</p>
    </div>
    <nav class="space-y-1">
      <NuxtLink to="/" class="block px-3 py-2 rounded-lg hover:bg-slate-800">Dashboard</NuxtLink>
      <NuxtLink to="/admin/activities" class="block px-3 py-2 rounded-lg hover:bg-slate-800">Semua Kegiatan</NuxtLink>
      <NuxtLink to="/admin/activities/new" class="block px-3 py-2 rounded-lg hover:bg-slate-800">Tambah Kegiatan</NuxtLink>
      <UButton to="/login" variant="outline" color="red" class="mt-6 w-full" @click="handleLogout">Keluar</UButton>
    </nav>
  </aside>
</template>

<script setup lang="ts">
async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  navigateTo('/login')
}
</script>