<script setup lang="ts">
// Menentukan middleware admin untuk melindungi halaman ini agar hanya bisa diakses oleh admin
definePageMeta({ middleware: 'admin' })

// Interface untuk tipe data wilayah (Region)
interface Region {
  id: string
  code: string
  name: string
  description: string | null
  isActive: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// Mengambil data wilayah secara async dari API endpoint admin/regions
const { data: regions, pending, refresh } = useAsyncData<Region[]>('regions', async () => {
  const res = await $fetch<{ data: Region[] }>('/api/admin/regions')
  return res.data
})

// State untuk mengontrol modal, pengeditan, dan proses penghapusan
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ code: '', name: '', description: '', isActive: true })
const loading = ref(false)
const deleteConfirmId = ref<string | null>(null)
const deleteConfirmOpen = ref(false)
const deleteLoading = ref(false)

const toast = useToast()

// Mendefinisikan kolom tabel untuk menampilkan data wilayah
const columns: TableColumn<Region>[] = [
  {
    accessorKey: 'code',
    header: 'Kode',
    meta: { class: { td: 'whitespace-nowrap font-medium' } },
  },
  {
    accessorKey: 'name',
    header: 'Nama',
  },
  {
    accessorKey: 'description',
    header: 'Deskripsi',
    cell: ({ row }) => row.getValue('description') || '-',
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) =>
      h(UBadge, {
        label: row.getValue('isActive') ? 'Aktif' : 'Nonaktif',
        variant: 'subtle',
        color: row.getValue('isActive') ? 'success' : 'neutral',
        size: 'xs',
      }),
  },
  {
    id: 'actions',
    header: '',
    meta: { class: { td: 'text-right' } },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end gap-1' }, [
        // Tombol edit untuk membuka modal pengeditan wilayah
        h(UButton, {
          size: 'xs',
          variant: 'ghost',
          icon: 'i-lucide-pencil',
          onClick: () => openEdit(row.original),
        }),
        // Tombol toggle aktif/nonaktif untuk mengubah status wilayah
        h(UButton, {
          size: 'xs',
          variant: 'ghost',
          color: row.original.isActive ? 'warning' : 'success',
          icon: row.original.isActive ? 'i-lucide-pause' : 'i-lucide-play',
          onClick: () => toggleActive(row.original),
        }),
        // Tombol hapus untuk memicu konfirmasi penghapusan wilayah
        h(UButton, {
          size: 'xs',
          variant: 'ghost',
          color: 'error',
          icon: 'i-lucide-trash',
          onClick: () => (deleteConfirmId.value = row.original.id),
        }),
      ]),
  },
]

// Watch untuk mengontrol keterbukaan modal konfirmasi hapus berdasarkan deleteConfirmId
watch(deleteConfirmId, (val) => {
  deleteConfirmOpen.value = val !== null
})

// Fungsi validasi untuk memastikan kode dan nama wilayah terisi
// Parameter: state - objek berisi kode dan nama wilayah
// Return: array of errors dengan nama field dan pesan error
function validate(state: { code: string; name: string }) {
  const errors: { name: string; message: string }[] = []
  if (!state.code?.trim()) errors.push({ name: 'code', message: 'Kode wilayah wajib diisi' })
  if (!state.name?.trim()) errors.push({ name: 'name', message: 'Nama wilayah wajib diisi' })
  return errors
}

// Fungsi untuk membuka modal pembuatan wilayah baru
// Mengosongkan form dan mengatur mode menjadi create
function openCreate() {
  editingId.value = null
  form.value = { code: '', name: '', description: '', isActive: true }
  modalOpen.value = true
}

// Fungsi untuk membuka modal pengeditan wilayah yang sudah ada
// Parameter: region - data wilayah yang akan diedit
// Mengisi form dengan data wilayah yang dipilih
function openEdit(region: Region) {
  editingId.value = region.id
  form.value = {
    code: region.code,
    name: region.name,
    description: region.description || '',
    isActive: !!region.isActive,
  }
  modalOpen.value = true
}

// Fungsi untuk menyimpan wilayah (baru atau edit)
// Jika editingId ada, lakukan PATCH update; jika tidak, lakukan POST tambah baru
async function handleSubmit() {
  loading.value = true
  try {
    if (editingId.value) {
      // Mengirim permintaan PATCH untuk memperbarui wilayah yang sudah ada
      await $fetch(`/api/admin/regions/${editingId.value}`, {
        method: 'PATCH',
        body: form.value,
      })
      toast.add({ color: 'success', title: 'Wilayah diperbarui' })
    } else {
      // Mengirim permintaan POST untuk menambahkan wilayah baru
      await $fetch('/api/admin/regions', {
        method: 'POST',
        body: form.value,
      })
      toast.add({ color: 'success', title: 'Wilayah ditambahkan' })
    }
    modalOpen.value = false
    await refresh()
  } catch (e: any) {
    // Menampilkan toast error jika gagal menyimpan
    toast.add({ color: 'error', title: 'Gagal menyimpan', description: e.data?.message || 'Terjadi kesalahan' })
  } finally {
    loading.value = false
  }
}

// Fungsi untuk mengaktifkan atau menonaktifkan wilayah
// Parameter: region - data wilayah yang statusnya akan diubah
// Melakukan toggle isActive dan merefresh data
async function toggleActive(region: Region) {
  try {
    await $fetch(`/api/admin/regions/${region.id}`, {
      method: 'PATCH',
      body: { isActive: !region.isActive },
    })
    // Menampilkan toast sesuai dengan status baru wilayah
    toast.add({ color: 'success', title: region.isActive ? 'Wilayah dinonaktifkan' : 'Wilayah diaktifkan' })
    await refresh()
  } catch (e: any) {
    // Menampilkan toast error jika gagal mengubah status
    toast.add({ color: 'error', title: 'Gagal mengubah status', description: e.data?.message || 'Terjadi kesalahan' })
  }
}

// Fungsi untuk menghapus wilayah secara permanen
// Menggunakan deleteConfirmId untuk mengidentifikasi wilayah yang akan dihapus
async function handleDelete() {
  if (!deleteConfirmId.value) return
  deleteLoading.value = true
  try {
    await $fetch(`/api/admin/regions/${deleteConfirmId.value}`, { method: 'DELETE' })
    deleteConfirmId.value = null
    toast.add({ color: 'success', title: 'Wilayah dihapus' })
    await refresh()
  } catch (e: any) {
    // Menampilkan toast error jika gagal menghapus
    toast.add({ color: 'error', title: 'Gagal menghapus', description: e.data?.message || 'Terjadi kesalahan' })
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <!-- Container utama halaman wilayah dengan padding -->
  <div class="p-8">
    <!-- Header halaman dengan judul dan tombol tambah wilayah -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Wilayah</h1>
      <UButton size="sm" @click="openCreate">Tambah Wilayah</UButton>
    </div>

    <!-- Kartu tabel wilayah -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <!-- Tabel data wilayah dengan kolom yang telah didefinisikan -->
      <UTable
        :data="regions || []"
        :columns="columns"
        :loading="pending"
        :get-row-id="(row) => row.id"
        empty="Belum ada wilayah"
      />
    </UCard>

    <!-- Modal untuk menambah atau mengedit wilayah -->
    <UModal v-model:open="modalOpen" :title="editingId ? 'Edit Wilayah' : 'Tambah Wilayah'">
      <template #body>
        <!-- Formulir untuk input data wilayah -->
        <UForm :state="form" :validate="validate" class="space-y-3" @submit="handleSubmit">
          <UFormField label="Kode Wilayah" name="code" required>
            <UInput v-model="form.code" placeholder="Contoh: I, II, III" class="w-full" required />
          </UFormField>
          <UFormField label="Nama Wilayah" name="name" required>
            <UInput v-model="form.name" placeholder="Nama wilayah" class="w-full" required />
          </UFormField>
          <UFormField label="Deskripsi" name="description">
            <UTextarea v-model="form.description" placeholder="Deskripsi opsional" class="w-full" />
          </UFormField>
          <UFormField label="Status" name="isActive">
            <UCheckbox v-model="form.isActive" label="Wilayah aktif" />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" @click="modalOpen = false">Batal</UButton>
            <UButton type="submit" :loading="loading">
              {{ editingId ? 'Simpan Perubahan' : 'Tambah' }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Modal konfirmasi penghapusan wilayah -->
    <UModal v-model:open="deleteConfirmOpen" title="Konfirmasi Hapus">
      <template #body>
        <!-- Peringatan bahwa wilayah dengan data terkait tidak bisa dihapus -->
        <p class="text-slate-600">Wilayah yang sudah memiliki pengguna, sekolah, atau kegiatan tidak dapat dihapus permanen. Lanjutkan?</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="deleteConfirmId = null">Batal</UButton>
          <UButton color="error" :loading="deleteLoading" @click="handleDelete">Hapus</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
