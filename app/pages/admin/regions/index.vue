<script setup lang="ts">
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

const { data: regions, pending, refresh } = useAsyncData<Region[]>('regions', async () => {
  const res = await $fetch<{ data: Region[] }>('/api/admin/regions')
  return res.data
})

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ code: '', name: '', description: '', isActive: true })
const loading = ref(false)
const deleteConfirmId = ref<string | null>(null)
const deleteConfirmOpen = ref(false)
const deleteLoading = ref(false)

const toast = useToast()

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
        h(UButton, {
          size: 'xs',
          variant: 'ghost',
          icon: 'i-lucide-pencil',
          onClick: () => openEdit(row.original),
        }),
        h(UButton, {
          size: 'xs',
          variant: 'ghost',
          color: row.original.isActive ? 'warning' : 'success',
          icon: row.original.isActive ? 'i-lucide-pause' : 'i-lucide-play',
          onClick: () => toggleActive(row.original),
        }),
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

watch(deleteConfirmId, (val) => {
  deleteConfirmOpen.value = val !== null
})

function validate(state: { code: string; name: string }) {
  const errors: { name: string; message: string }[] = []
  if (!state.code?.trim()) errors.push({ name: 'code', message: 'Kode wilayah wajib diisi' })
  if (!state.name?.trim()) errors.push({ name: 'name', message: 'Nama wilayah wajib diisi' })
  return errors
}

function openCreate() {
  editingId.value = null
  form.value = { code: '', name: '', description: '', isActive: true }
  modalOpen.value = true
}

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

async function handleSubmit() {
  loading.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/regions/${editingId.value}`, {
        method: 'PATCH',
        body: form.value,
      })
      toast.add({ color: 'success', title: 'Wilayah diperbarui' })
    } else {
      await $fetch('/api/admin/regions', {
        method: 'POST',
        body: form.value,
      })
      toast.add({ color: 'success', title: 'Wilayah ditambahkan' })
    }
    modalOpen.value = false
    await refresh()
  } catch (e: any) {
    toast.add({ color: 'error', title: 'Gagal menyimpan', description: e.data?.message || 'Terjadi kesalahan' })
  } finally {
    loading.value = false
  }
}

async function toggleActive(region: Region) {
  try {
    await $fetch(`/api/admin/regions/${region.id}`, {
      method: 'PATCH',
      body: { isActive: !region.isActive },
    })
    toast.add({ color: 'success', title: region.isActive ? 'Wilayah dinonaktifkan' : 'Wilayah diaktifkan' })
    await refresh()
  } catch (e: any) {
    toast.add({ color: 'error', title: 'Gagal mengubah status', description: e.data?.message || 'Terjadi kesalahan' })
  }
}

async function handleDelete() {
  if (!deleteConfirmId.value) return
  deleteLoading.value = true
  try {
    await $fetch(`/api/admin/regions/${deleteConfirmId.value}`, { method: 'DELETE' })
    deleteConfirmId.value = null
    toast.add({ color: 'success', title: 'Wilayah dihapus' })
    await refresh()
  } catch (e: any) {
    toast.add({ color: 'error', title: 'Gagal menghapus', description: e.data?.message || 'Terjadi kesalahan' })
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Wilayah</h1>
      <UButton size="sm" @click="openCreate">Tambah Wilayah</UButton>
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UTable
        :data="regions || []"
        :columns="columns"
        :loading="pending"
        :get-row-id="(row) => row.id"
        empty="Belum ada wilayah"
      />
    </UCard>

    <UModal v-model:open="modalOpen" :title="editingId ? 'Edit Wilayah' : 'Tambah Wilayah'">
      <template #body>
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

    <UModal v-model:open="deleteConfirmOpen" title="Konfirmasi Hapus">
      <template #body>
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
