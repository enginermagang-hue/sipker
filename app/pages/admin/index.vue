<script setup lang="ts">
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
    <p class="text-slate-600 mt-2">Selamat datang di SI Kinerja — Sistem Informasi Kegiatan Pelayanan Dapodik.</p>
    <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <UCard title="Wilayah" class="p-4">
        <p class="text-3xl font-bold">5</p>
        <p class="text-sm text-slate-500">Wilayah aktif</p>
      </UCard>
      <UCard title="Kategori" class="p-4">
        <p class="text-3xl font-bold">3</p>
        <p class="text-sm text-slate-500">Jenis kegiatan</p>
      </UCard>
      <UCard title="Sekolah" class="p-4">
        <p class="text-3xl font-bold">-</p>
        <p class="text-sm text-slate-500">Data sekolah</p>
      </UCard>
      <UCard title="Pengguna" class="p-4">
        <p class="text-3xl font-bold">1</p>
        <p class="text-sm text-slate-500">Akun aktif</p>
      </UCard>
    </div>
  </div>
</template>
