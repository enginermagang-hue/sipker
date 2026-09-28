<script setup lang="ts">
// Menentukan middleware admin untuk melindungi halaman daftar kegiatan
definePageMeta({ middleware: 'admin' })

// State filter untuk pencarian dan penyaringan kegiatan
const filters = ref({ search: '', status: '', regionId: '', from: '', to: '' })

// Opsi status kegiatan untuk dropdown filter
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Menunggu' },
  { value: 'needs_revision', label: 'Perlu Perbaikan' },
  { value: 'checked', label: 'Sudah Dicek' },
]

// Opsi wilayah untuk dropdown filter
const regionOptions = [
  { value: 'I', label: 'Wilayah I' },
  { value: 'II', label: 'Wilayah II' },
  { value: 'III', label: 'Wilayah III' },
  { value: 'IV', label: 'Wilayah IV' },
  { value: 'V', label: 'Wilayah V' },
]

// Fungsi untuk mengembalikan kelas CSS berdasarkan status kegiatan
// Parameter: status - string status kegiatan
// Return: string kelas CSS Tailwind untuk styling badge status
function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    submitted: 'bg-amber-100 text-amber-700',
    needs_revision: 'bg-rose-100 text-rose-700',
    checked: 'bg-emerald-100 text-emerald-700',
  }
  return map[status] || 'bg-slate-100 text-slate-600'
}

// Fungsi untuk memformat tanggal ISO menjadi format Indonesia yang mudah dibaca
// Parameter: iso - string tanggal dalam format ISO
// Return: string tanggal yang sudah diformat sesuai locale Indonesia
function formatDate(iso: string) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Mengambil data kegiatan secara async dengan filter yang diterapkan
// Data direfetch otomatis ketika filter berubah
const { data: activities } = useAsyncData<any[]>('activities', async () => {
  const res = await $fetch<{ data: any[] }>('/api/activities', { query: filters.value })
  return res.data
}, { watch: [() => ({ ...filters.value })] })
</script>

<template>
  <!-- Container utama halaman daftar kegiatan -->
  <div class="p-8">
    <!-- Header halaman dengan judul dan tombol tambah kegiatan -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Semua Kegiatan</h1>
      <UButton to="/admin/activities/new" size="sm">Tambah Kegiatan</UButton>
    </div>

    <!-- Baris filter untuk pencarian dan penyaringan kegiatan -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-100">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <!-- Input pencarian berdasarkan nama konsultan -->
        <UInput placeholder="Cari konsultan..." v-model="filters.search" size="sm" />
        <!-- Dropdown filter status -->
        <USelect placeholder="Status" v-model="filters.status" :items="statusOptions" size="sm" />
        <!-- Dropdown filter wilayah -->
        <USelect placeholder="Wilayah" v-model="filters.regionId" :items="regionOptions" size="sm" />
        <!-- Input filter tanggal dari -->
        <UInput type="date" v-model="filters.from" placeholder="Dari" size="sm" />
        <!-- Input filter tanggal sampai -->
        <UInput type="date" v-model="filters.to" placeholder="Sampai" size="sm" />
      </div>
    </div>

    <!-- Tabel daftar kegiatan -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
        <!-- Header tabel dengan kolom-kolom data kegiatan -->
        <thead class="bg-slate-50 text-slate-600 font-medium">
          <tr>
            <th class="px-4 py-3 text-left">Tanggal</th>
            <th class="px-4 py-3 text-left">Konsultan</th>
            <th class="px-4 py-3 text-left">Sekolah</th>
            <th class="px-4 py-3 text-left">Kategori</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Bukti</th>
            <th class="px-4 py-3 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <!-- Baris tabel untuk setiap kegiatan -->
          <tr v-for="item in activities" :key="item.id" class="border-t border-slate-100 hover:bg-slate-50">
            <!-- Tanggal kegiatan -->
            <td class="px-4 py-3">{{ formatDate(item.activityAt) }}</td>
            <!-- Nama konsultan -->
            <td class="px-4 py-3">{{ item.consultantName }}</td>
            <!-- Nama sekolah -->
            <td class="px-4 py-3">{{ item.schoolName }}</td>
            <!-- Nama kategori -->
            <td class="px-4 py-3">{{ item.categoryName }}</td>
            <!-- Status dengan badge warna -->
            <td class="px-4 py-3">
              <span :class="statusBadge(item.status)" class="inline-block px-2 py-0.5 rounded-full text-xs font-medium">{{ item.status }}</span>
            </td>
            <!-- Jumlah bukti -->
            <td class="px-4 py-3">{{ item.evidenceCount || 0 }}</td>
            <!-- Tautan detail kegiatan -->
            <td class="px-4 py-3">
              <NuxtLink :to="`/admin/activities/${item.id}`" class="text-blue-600 hover:text-blue-800 text-xs font-medium">Detail</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
