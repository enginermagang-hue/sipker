<script setup lang="ts">
// Menentukan middleware admin untuk melindungi halaman tambah kegiatan
definePageMeta({ middleware: 'admin' })

// State form untuk menyimpan data kegiatan baru
const form = ref({ activityAt: '', schoolId: '', consultantName: '', categoryId: '', topic: '', actionTaken: '', result: '', followUp: '', notes: '' })
const loading = ref(false)

// Opsi daftar sekolah (placeholder)
const schoolOptions = [{ value: 'test', label: 'Sekolah Test (placeholder)' }]

// Opsi daftar kategori kegiatan yang tersedia
const categoryOptions = [
  { value: 'cat-1', label: 'Konsultasi Dapodik' },
  { value: 'cat-2', label: 'Update Data Peserta Didik' },
  { value: 'cat-3', label: 'Update Data PTK' },
]

// Fungsi untuk menangani pengiriman form kegiatan baru
// Mengirim data form ke API endpoint activities dengan method POST
async function handleSubmit() {
  loading.value = true
  try {
    // Mengirim permintaan POST untuk menyimpan data kegiatan baru
    await $fetch('/api/activities', {
      method: 'POST',
      body: form.value,
    })
    // Mengarahkan ke halaman daftar kegiatan setelah berhasil disimpan
    navigateTo('/admin/activities')
  } catch (e: any) {
    // Menampilkan alert error jika gagal menyimpan
    alert(e.data?.message || 'Gagal menyimpan')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- Panel dengan navbar untuk halaman tambah kegiatan — pola dashboard template -->
  <UDashboardPanel id="activities-new">
    <template #header>
      <UDashboardNavbar title="Tambah Kegiatan">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <!-- Container utama halaman tambah kegiatan -->
      <div>
        <!-- Judul halaman -->
        <h1 class="text-2xl font-bold text-slate-900 mb-6">Tambah Kegiatan</h1>
        <!-- Formulir untuk input data kegiatan baru -->
        <UForm :state="form" class="space-y-5 max-w-3xl bg-white p-6 rounded-xl shadow-sm" @submit.prevent="handleSubmit">
          <!-- Field tanggal dan waktu kegiatan -->
          <UFormField label="Tanggal & Waktu Kegiatan">
            <UInput v-model="form.activityAt" type="datetime-local" />
          </UFormField>
          <!-- Field pemilihan sekolah -->
          <UFormField label="Sekolah">
            <USelect v-model="form.schoolId" :items="schoolOptions" placeholder="Pilih sekolah" />
          </UFormField>
          <!-- Field nama guru/konsultan -->
          <UFormField label="Nama Guru / Konsultan">
            <UInput v-model="form.consultantName" placeholder="Nama lengkap" />
          </UFormField>
          <!-- Field pemilihan kategori kegiatan -->
          <UFormField label="Kategori Kegiatan">
            <USelect v-model="form.categoryId" :items="categoryOptions" placeholder="Pilih kategori" />
          </UFormField>
          <!-- Field topik konsultasi -->
          <UFormField label="Topik Konsultasi">
            <UTextarea v-model="form.topic" placeholder="Ringkasan masalah" />
          </UFormField>
          <!-- Field tindakan yang dilakukan -->
          <UFormField label="Tindakan yang Dilakukan">
            <UTextarea v-model="form.actionTaken" placeholder="Apa yang dilakukan petugas" />
          </UFormField>
          <!-- Field hasil / tindak lanjut -->
          <UFormField label="Hasil / Tindak Lanjut">
            <UTextarea v-model="form.result" placeholder="Hasil kegiatan" />
          </UFormField>
          <!-- Tombol simpan draft -->
          <UButton type="submit" :loading="loading" class="w-full">Simpan Draft</UButton>
        </UForm>
      </div>
    </template>
  </UDashboardPanel>
</template>
