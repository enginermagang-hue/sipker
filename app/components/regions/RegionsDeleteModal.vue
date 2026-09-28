<script setup lang="ts">
// Komponen modal untuk konfirmasi penghapusan wilayah
// Menampilkan peringatan dan tombol konfirmasi hapus

const props = defineProps<{
  open: boolean
  deleteLoading: boolean
}>()

const emit = defineEmits<{
  confirm: []
  'update:open': []
}>()

// Fungsi untuk menangani konfirmasi penghapusan
async function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <!-- Modal konfirmasi penghapusan wilayah -->
  <UModal :open="open" title="Konfirmasi Hapus" @update:open="emit('update:open')">
    <template #body>
      <!-- Peringatan bahwa wilayah dengan data terkait tidak bisa dihapus -->
      <p class="text-slate-600">Wilayah yang sudah memiliki pengguna, sekolah, atau kegiatan tidak dapat dihapus permanen. Lanjutkan?</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="emit('update:open')">Batal</UButton>
        <!-- Tombol hapus dengan indicator loading -->
        <UButton color="error" :loading="deleteLoading" @click="handleConfirm">
          Hapus
          <template v-if="deleteLoading" #trailing>
            <UKbd>...</UKbd>
          </template>
        </UButton>
      </div>
    </template>
  </UModal>
</template>
