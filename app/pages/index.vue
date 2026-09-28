<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div class="text-center px-8">
      <h1 class="text-5xl font-extrabold text-slate-900 mb-4">SI Kinerja</h1>
      <p class="text-xl text-slate-600 mb-8">Sistem Informasi Kegiatan Pelayanan Dapodik UPTD Tekkomdik</p>
      <div class="space-y-3">
        <UButton to="/admin" size="xl" class="w-64">Dashboard Admin</UButton>
        <UButton to="/login" variant="outline" size="xl" class="w-64">Masuk</UButton>
      </div>
    </div>
  </div>
</template>