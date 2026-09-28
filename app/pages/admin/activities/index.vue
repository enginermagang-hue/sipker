<script setup lang="ts">

const filters = ref({ search: '', status: '', regionId: '', from: '', to: '' })

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Menunggu' },
  { value: 'needs_revision', label: 'Perlu Perbaikan' },
  { value: 'checked', label: 'Sudah Dicek' },
]
const regionOptions = [
  { value: 'I', label: 'Wilayah I' },
  { value: 'II', label: 'Wilayah II' },
  { value: 'III', label: 'Wilayah III' },
  { value: 'IV', label: 'Wilayah IV' },
  { value: 'V', label: 'Wilayah V' },
]

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    submitted: 'bg-amber-100 text-amber-700',
    needs_revision: 'bg-rose-100 text-rose-700',
    checked: 'bg-emerald-100 text-emerald-700',
  }
  return map[status] || 'bg-slate-100 text-slate-600'
}

function formatDate(iso: string) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const { data: activities } = useAsyncData<any[]>('activities', async () => {
  const res = await $fetch<{ data: any[] }>('/api/activities', { query: filters.value })
  return res.data
}, { watch: [() => ({ ...filters.value })] })
</script>

<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Semua Kegiatan</h1>
      <UButton to="/admin/activities/new" size="sm">Tambah Kegiatan</UButton>
    </div>

    <!-- Filter bar -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-100">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <UInput placeholder="Cari konsultan..." v-model="filters.search" size="sm" />
        <USelect placeholder="Status" v-model="filters.status" :items="statusOptions" size="sm" />
        <USelect placeholder="Wilayah" v-model="filters.regionId" :items="regionOptions" size="sm" />
        <UInput type="date" v-model="filters.from" placeholder="Dari" size="sm" />
        <UInput type="date" v-model="filters.to" placeholder="Sampai" size="sm" />
      </div>
    </div>

    <!-- Activity table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
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
          <tr v-for="item in activities" :key="item.id" class="border-t border-slate-100 hover:bg-slate-50">
            <td class="px-4 py-3">{{ formatDate(item.activityAt) }}</td>
            <td class="px-4 py-3">{{ item.consultantName }}</td>
            <td class="px-4 py-3">{{ item.schoolName }}</td>
            <td class="px-4 py-3">{{ item.categoryName }}</td>
            <td class="px-4 py-3">
              <span :class="statusBadge(item.status)" class="inline-block px-2 py-0.5 rounded-full text-xs font-medium">{{ item.status }}</span>
            </td>
            <td class="px-4 py-3">{{ item.evidenceCount || 0 }}</td>
            <td class="px-4 py-3">
              <NuxtLink :to="`/admin/activities/${item.id}`" class="text-blue-600 hover:text-blue-800 text-xs font-medium">Detail</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
