<script setup lang="ts">
// Menentukan middleware admin untuk melindungi halaman detail kegiatan
definePageMeta({ middleware: 'admin' })

// Mengambil parameter ID dari URL untuk mengidentifikasi kegiatan yang dilihat
const route = useRoute()
const id = route.params.id as string
const loading = ref(true)
const data = ref<any>(null)

// Fungsi untuk mengembalikan kelas CSS berdasarkan status kegiatan
// Parameter: status - string status kegiatan (draft, submitted, needs_revision, checked)
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
// Return: string tanggal yang sudah diformat (contoh: 1 Januari 2026)
function formatDate(iso: string) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Mengambil data kegiatan berdasarkan ID dari API endpoint activities/[id]
const { data: result } = await useFetch(`/api/activities/${id}`)
data.value = result.value
loading.value = false

// Fungsi untuk mengunduh bukti dokumentasi kegiatan
// Parameter: evidenceId - ID file bukti yang akan diunduh
// Membuka URL download di tab baru
async function downloadEvidence(evidenceId: string) {
  window.open(`/api/evidence/${evidenceId}/download`, '_blank')
}
</script>

<template>
  <!-- Container utama halaman detail kegiatan -->
  <div class="p-8">
    <!-- Menampilkan loading state saat data sedang dimuat -->
    <div v-if="loading" class="text-slate-400">Memuat...</div>
    <!-- Menampilkan detail kegiatan jika data sudah tersedia -->
    <div v-else-if="data?.data">
      <!-- Header dengan tombol kembali dan judul halaman -->
      <div class="flex items-center gap-3 mb-6">
        <UButton to="/admin/activities" variant="outline" size="sm">? Kembali</UButton>
        <h1 class="text-2xl font-bold text-slate-900">Detail Kegiatan</h1>
      </div>

      <!-- Kartu informasi utama kegiatan -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <!-- Grid dua kolom untuk menampilkan detail kegiatan -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <!-- Tanggal kegiatan -->
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Tanggal</p>
            <p class="font-medium">{{ formatDate(data.data.activityAt) }}</p>
          </div>
          <!-- Status kegiatan dengan badge warna -->
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Status</p>
            <span :class="statusBadge(data.data.status)" class="inline-block px-2 py-0.5 rounded-full text-xs font-medium">{{ data.data.status }}</span>
          </div>
          <!-- Nama sekolah -->
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Sekolah</p>
            <p class="font-medium">{{ data.data.schoolName }}</p>
          </div>
          <!-- Nama wilayah -->
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Wilayah</p>
            <p class="font-medium">{{ data.data.regionName }}</p>
          </div>
          <!-- Nama konsultan -->
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Konsultan</p>
            <p class="font-medium">{{ data.data.consultantName }}</p>
          </div>
          <!-- Nama kategori -->
          <div>
            <p class="text-slate-400 text-xs mb-0.5">Kategori</p>
            <p class="font-medium">{{ data.data.categoryName }}</p>
          </div>
        </div>

        <!-- Bagian topik, tindakan, dan hasil -->
        <div class="mt-6 space-y-4">
          <!-- Topik konsultasi -->
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Topik</h3>
            <p class="text-slate-800">{{ data.data.topic }}</p>
          </div>
          <!-- Tindakan yang dilakukan -->
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tindakan</h3>
            <p class="text-slate-800">{{ data.data.actionTaken }}</p>
          </div>
          <!-- Hasil / Tindak Lanjut -->
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hasil / Tindak Lanjut</h3>
            <p class="text-slate-800">{{ data.data.result }}</p>
          </div>
        </div>
      </div>

      <!-- Kartu bukti dokumentasi -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 class="text-base font-bold text-slate-900 mb-3">Bukti Dokumentasi</h2>
        <!-- Daftar file bukti jika tersedia -->
        <div v-if="data.evidence && data.evidence.length" class="space-y-2">
          <div v-for="ev in data.evidence" :key="ev.id" class="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
            <div>
              <p class="font-medium text-sm text-slate-800">{{ ev.fileName }}</p>
              <p class="text-xs text-slate-400">{{ ev.mimeType }} � {{ Math.round(ev.fileSize / 1024) }} KB</p>
            </div>
            <!-- Tombol download untuk setiap file bukti -->
            <UButton size="xs" variant="outline" @click="downloadEvidence(ev.id)">Download</UButton>
          </div>
        </div>
        <!-- Pesan jika belum ada bukti -->
        <p v-else class="text-sm text-slate-400">Belum ada bukti.</p>
      </div>

      <!-- Kartu riwayat pemeriksaan -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 class="text-base font-bold text-slate-900 mb-3">Riwayat Pemeriksaan</h2>
        <!-- Daftar riwayat pemeriksaan jika tersedia -->
        <div v-if="data.reviews && data.reviews.length" class="space-y-3">
          <div v-for="rev in data.reviews" :key="rev.id" class="border-b border-slate-100 pb-3 last:border-0">
            <!-- Informasi aksi dan tanggal -->
            <div class="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>{{ rev.action }}</span> � <span>{{ new Date(rev.createdAt).toLocaleString('id-ID') }}</span>
            </div>
            <!-- Catatan pemeriksaan -->
            <p class="text-sm text-slate-700">{{ rev.note }}</p>
          </div>
        </div>
        <!-- Pesan jika belum ada riwayat -->
        <p v-else class="text-sm text-slate-400">Belum ada riwayat.</p>
      </div>
    </div>
  </div>
</template>
