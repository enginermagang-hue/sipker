<script setup lang="ts">

const form = ref({ activityAt: '', schoolId: '', consultantName: '', categoryId: '', topic: '', actionTaken: '', result: '', followUp: '', notes: '' })
const loading = ref(false)
const schoolOptions = [{ value: 'test', label: 'Sekolah Test (placeholder)' }]
const categoryOptions = [
  { value: 'cat-1', label: 'Konsultasi Dapodik' },
  { value: 'cat-2', label: 'Update Data Peserta Didik' },
  { value: 'cat-3', label: 'Update Data PTK' },
]

async function handleSubmit() {
  loading.value = true
  try {
    await $fetch('/api/activities', {
      method: 'POST',
      body: form.value,
    })
    navigateTo('/admin/activities')
  } catch (e: any) {
    alert(e.data?.message || 'Gagal menyimpan')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold text-slate-900 mb-6">Tambah Kegiatan</h1>
    <UForm :state="form" class="space-y-5 max-w-3xl bg-white p-6 rounded-xl shadow-sm" @submit.prevent="handleSubmit">
      <UFormField label="Tanggal & Waktu Kegiatan">
        <UInput v-model="form.activityAt" type="datetime-local" />
      </UFormField>
      <UFormField label="Sekolah">
        <USelect v-model="form.schoolId" :items="schoolOptions" placeholder="Pilih sekolah" />
      </UFormField>
      <UFormField label="Nama Guru / Konsultan">
        <UInput v-model="form.consultantName" placeholder="Nama lengkap" />
      </UFormField>
      <UFormField label="Kategori Kegiatan">
        <USelect v-model="form.categoryId" :items="categoryOptions" placeholder="Pilih kategori" />
      </UFormField>
      <UFormField label="Topik Konsultasi">
        <UTextarea v-model="form.topic" placeholder="Ringkasan masalah" />
      </UFormField>
      <UFormField label="Tindakan yang Dilakukan">
        <UTextarea v-model="form.actionTaken" placeholder="Apa yang dilakukan petugas" />
      </UFormField>
      <UFormField label="Hasil / Tindak Lanjut">
        <UTextarea v-model="form.result" placeholder="Hasil kegiatan" />
      </UFormField>
      <UButton type="submit" :loading="loading" class="w-full">Simpan Draft</UButton>
    </UForm>
  </div>
</template>
