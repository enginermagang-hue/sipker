<script setup lang="ts">
// Komponen modal untuk menambah dan mengedit wilayah
// Menggunakan UModal, UForm, dan UFormField dari Nuxt UI

const props = defineProps<{
  open: boolean
  editingId: string | null
  form: { code: string; name: string; description: string; isActive: boolean }
  loading: boolean
}>()

const emit = defineEmits<{
  submit: [payload: { code: string; name: string; description: string; isActive: boolean }]
  'update:open': []
}>()

const toast = useToast()

// Validasi form: kode dan nama wilayah wajib diisi
function validate(state: { code: string; name: string }) {
  const errors: { name: string; message: string }[] = []
  if (!state.code?.trim()) errors.push({ name: 'code', message: 'Kode wilayah wajib diisi' })
  if (!state.name?.trim()) errors.push({ name: 'name', message: 'Nama wilayah wajib diisi' })
  return errors
}

// Fungsi untuk menangani pengiriman form
// Mengirim data ke emit 'submit' untuk diproses oleh halaman induk
async function handleSubmit() {
  emit('submit', props.form)
}
</script>

<template>
  <!-- Modal untuk menambah atau mengedit wilayah -->
  <UModal :open="open" :title="editingId ? 'Edit Wilayah' : 'Tambah Wilayah'" @update:open="emit('update:open')">
    <template #body>
      <!-- Formulir untuk input data wilayah -->
      <UForm id="regions-form" :state="form" :validate="validate" class="space-y-3" @submit="handleSubmit">
        <!-- Field kode wilayah -->
        <UFormField label="Kode Wilayah" name="code" required>
          <UInput v-model="form.code" placeholder="Contoh: I, II, III" class="w-full" required />
        </UFormField>
        <!-- Field nama wilayah -->
        <UFormField label="Nama Wilayah" name="name" required>
          <UInput v-model="form.name" placeholder="Nama wilayah" class="w-full" required />
        </UFormField>
        <!-- Field deskripsi wilayah -->
        <UFormField label="Deskripsi" name="description">
          <UTextarea v-model="form.description" placeholder="Deskripsi opsional" class="w-full" />
        </UFormField>
        <!-- Field status aktif/nonaktif -->
        <UFormField label="Status" name="isActive">
          <UCheckbox v-model="form.isActive" label="Wilayah aktif" />
        </UFormField>
        <!-- Tombol aksi -->
        <div class="flex justify-end gap-2 pt-2">
          <UButton variant="ghost" @click="emit('update:open')">Batal</UButton>
          <UButton type="submit" form="regions-form" :loading="loading">
            {{ editingId ? 'Simpan Perubahan' : 'Tambah' }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
