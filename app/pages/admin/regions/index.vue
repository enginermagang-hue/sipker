<script setup lang="ts">
// Menentukan middleware admin untuk melindungi halaman ini agar hanya bisa diakses oleh admin
definePageMeta({ middleware: 'admin' })

// Import TanStack table utilities
import { getPaginationRowModel } from '@tanstack/table-core'
import { upperFirst } from 'scule'
import type { Row } from '@tanstack/table-core'
import type { TableColumn } from '@nuxt/ui'

// Resolve komponen untuk lazy loading
const UCheckbox = resolveComponent('UCheckbox')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UInput = resolveComponent('UInput')
const USelect = resolveComponent('USelect')
const UModal = resolveComponent('UModal')
const UKbd = resolveComponent('UKbd')
const UCard = resolveComponent('UCard')
const UTable = resolveComponent('UTable')
const UPagination = resolveComponent('UPagination')

// Resolve komponen modal terpisah
const RegionsAddModal = resolveComponent('RegionsAddModal')
const RegionsDeleteModal = resolveComponent('RegionsDeleteModal')

// Tipe data wilayah (Region)
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

// State untuk kontrol modal tambah/edit
const addModalOpen = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ code: '', name: '', description: '', isActive: true })
const formLoading = ref(false)

// State untuk kontrol modal penghapusan
const deleteModalOpen = ref(false)
const deleteConfirmId = ref<string | null>(null)
const deleteLoading = ref(false)

const toast = useToast()

// State untuk TanStack table
const table = useTemplateRef('table')
const columnFilters = ref([{ id: 'name', value: '' }])
const columnVisibility = ref({})
const rowSelection = ref({})
const searchQuery = ref('')
const statusFilter = ref('all')
const pagination = ref({ pageIndex: 0, pageSize: 10 })

// Data yang sudah difilter berdasarkan searchQuery dan statusFilter
const filteredRegions = computed(() => {
  if (!regions.value) return []
  let result = regions.value
  // Filter berdasarkan searchQuery (case-insensitive) pada name dan code
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
    )
  }
  // Filter berdasarkan statusFilter
  if (statusFilter.value === 'active') {
    result = result.filter(r => r.isActive === 1)
  } else if (statusFilter.value === 'inactive') {
    result = result.filter(r => r.isActive === 0)
  }
  return result
})

// Fungsi untuk membuka modal tambah wilayah
function openCreate() {
  editingId.value = null
  form.value = { code: '', name: '', description: '', isActive: true }
  addModalOpen.value = true
}

// Fungsi untuk membuka modal edit wilayah
// Parameter: region - data wilayah yang akan diedit
function openEdit(region: Region) {
  editingId.value = region.id
  form.value = {
    code: region.code,
    name: region.name,
    description: region.description || '',
    isActive: !!region.isActive,
  }
  addModalOpen.value = true
}

// Fungsi untuk menyimpan wilayah (baru atau edit)
// Jika editingId ada, lakukan PATCH update; jika tidak, lakukan POST tambah baru
async function handleSubmit() {
  formLoading.value = true
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
    addModalOpen.value = false
    console.log('[Wilayah] Menyimpan berhasil, memulai refresh...')
    await refresh()
    // Mencetak log setelah refresh berhasil agar mudah memantau
    console.log('[Wilayah] Refresh selesai, data wilayah:', regions.value?.length || 0)
  } catch (e: any) {
    toast.add({ color: 'error', title: 'Gagal menyimpan', description: e.data?.message || 'Terjadi kesalahan' })
  } finally {
    formLoading.value = false
  }
}

// Fungsi untuk mengaktifkan atau menonaktifkan wilayah
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

// Fungsi untuk menghapus wilayah secara permanen
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

// Watch untuk mengontrol keterbukaan modal penghapusan
watch(deleteConfirmId, (val) => {
  deleteModalOpen.value = val !== null
})

// Validasi form
function validate(state: { code: string; name: string }) {
  const errors: { name: string; message: string }[] = []
  if (!state.code?.trim()) errors.push({ name: 'code', message: 'Kode wilayah wajib diisi' })
  if (!state.name?.trim()) errors.push({ name: 'name', message: 'Nama wilayah wajib diisi' })
  return errors
}

// Mendefinisikan kolom tabel TanStack
const columns: TableColumn<Region>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'ariaLabel': 'Select row'
      })
  },
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
        class: 'capitalize',
        variant: 'subtle',
        color: row.getValue('isActive') ? 'success' : 'neutral',
        size: 'xs',
      }, () => row.getValue('isActive') ? 'Aktif' : 'Nonaktif'),
  },
  {
    id: 'actions',
    header: '',
    meta: { class: { td: 'text-right' } },
    cell: ({ row }) => {
      const region = row.original
      return h('div', { class: 'text-right' },
        h(UDropdownMenu, {
          content: { align: 'end' },
          items: [
            {
              type: 'label',
              label: 'Aksi'
            },
            {
              label: 'Edit',
              icon: 'i-lucide-pencil',
              onSelect: () => openEdit(region)
            },
            {
              label: region.isActive ? 'Nonaktifkan' : 'Aktifkan',
              icon: region.isActive ? 'i-lucide-pause' : 'i-lucide-play',
              color: region.isActive ? 'warning' : 'success',
              onSelect: () => toggleActive(region)
            },
            {
              type: 'separator'
            },
            {
              label: 'Hapus',
              icon: 'i-lucide-trash',
              color: 'error',
              onSelect: () => { deleteConfirmId.value = region.id }
            }
          ]
        }, () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            variant: 'ghost',
            class: 'ml-auto'
          })
        )
      )
    }
  }
]

// Item untuk column visibility dropdown
const columnVisibilityItems = computed(() => {
  return table.value?.tableApi?.getAllColumns()
    .filter((column: any) => column.getCanHide())
    .map((column: any) => ({
      label: upperFirst(column.id),
      type: 'checkbox' as const,
      checked: column.getIsVisible(),
      onUpdateChecked(checked: boolean) {
        table.value?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
      },
      onSelect(e?: Event) {
        e?.preventDefault()
      }
    })) || []
})

// Status filter items dalam bahasa Indonesia
const statusFilterItems = [
  { label: 'Semua', value: 'all' },
  { label: 'Aktif', value: 'active' },
  { label: 'Nonaktif', value: 'inactive' }
]

// Sync statusFilter dengan columnFilters
watch(statusFilter, (newVal) => {
  if (!table.value?.tableApi) return
  const nameColumn = table.value.tableApi.getColumn('name')
  if (!nameColumn) return
  if (newVal === 'all') {
    columnFilters.value = [{ id: 'name', value: '' }]
  } else {
    // Filter name column berdasarkan status (Aktif/Nonaktif)
    const searchTerm = searchQuery.value
    columnFilters.value = [{ id: 'name', value: searchTerm }]
  }
})

// Sync searchQuery dengan columnFilters
watch(searchQuery, (newVal) => {
  columnFilters.value = [{ id: 'name', value: newVal || '' }]
})

// Hitung jumlah row yang terpilih
const selectedCount = computed(() => {
  return table.value?.tableApi?.getFilteredSelectedRowModel().rows.length || 0
})

const rowCount = computed(() => {
  return table.value?.tableApi?.getFilteredRowModel().rows.length || 0
})
</script>

<template>
  <!-- Panel dengan navbar untuk halaman wilayah — pola dashboard template -->
  <UDashboardPanel id="regions">
    <template #header>
      <UDashboardNavbar title="Wilayah">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <!-- Tombol tambah wilayah dipindah ke navbar seperti dashboard template -->
          <UButton size="sm" @click="openCreate">Tambah Wilayah</UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Toolbar: search box, status filter, dan column visibility toggle -->
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <!-- Search box untuk filter wilayah berdasarkan nama dan kode -->
        <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Filter..." class="max-w-sm" />

        <div class="flex flex-wrap items-center gap-1.5">
          <!-- Dropdown filter status -->
          <USelect v-model="statusFilter" :items="statusFilterItems" placeholder="Filter status" class="min-w-28" />

          <!-- Dropdown toggle visibility kolom -->
          <UDropdownMenu :items="columnVisibilityItems" :content="{ align: 'end' }">
            <UButton label="Display" color="neutral" variant="outline" trailing-icon="i-lucide-settings-2" />
          </UDropdownMenu>
        </div>
      </div>

      <!-- Tabel data wilayah dengan TanStack Table -->
      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:column-visibility="columnVisibility"
        v-model:row-selection="rowSelection"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        class="shrink-0"
        :data="filteredRegions"
        :columns="columns"
        :loading="pending"
        :get-row-id="(row) => row.id"
        empty="Belum ada wilayah"
      />

      <!-- Footer pagination dan informasi row terpilih -->
      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          {{ selectedCount }} of {{ rowCount }} row(s) selected.
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>

      <!-- Modal tambah/edit wilayah -->
      <RegionsAddModal
        :open="addModalOpen"
        :editing-id="editingId"
        :form="form"
        :loading="formLoading"
        @submit="handleSubmit"
        @update:open="addModalOpen = false"
      />

      <!-- Modal konfirmasi penghapusan wilayah -->
      <RegionsDeleteModal
        :open="deleteModalOpen"
        :delete-loading="deleteLoading"
        @confirm="handleDelete"
        @update:open="deleteConfirmId = null"
      />
    </template>
  </UDashboardPanel>
</template>
