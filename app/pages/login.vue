<script setup lang="ts">
import * as z from 'zod'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

// Menentukan bahwa halaman login tidak menggunakan layout default
definePageMeta({ layout: false })

// Mengambil fungsi login dan layanan toast dari composable serta plugin
const { login } = useAuth()
const toast = useToast()

// State untuk menyimpan pesan error dan status loading
const error = ref('')
const loading = ref(false)

// Mendefinisikan field-form autentikasi: email dan password
const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'admin@uptdtekkomdik.local',
    required: true,
    defaultValue: '',
    eagerValidation: false
  },
  {
    name: 'password',
    type: 'password',
    label: 'Kata Sandi',
    placeholder: 'Masukkan kata sandi',
    required: true,
    defaultValue: '',
    eagerValidation: false
  }
]

// Skema validasi Zod untuk memastikan email dan password terisi dengan benar
const schema = z.object({
  email: z.string({ error: () => 'Email wajib diisi' }).email('Email tidak valid'),
  password: z.string({ error: () => 'Kata sandi wajib diisi' }).min(1, 'Kata sandi wajib diisi')
})

// Tipe data output dari skema validasi
type Schema = z.output<typeof schema>

// Fungsi untuk menangani pengiriman form login
// Parameter: payload - berisi data email dan password dari form
// Return: tidak ada return, tetapi mengarahkan ke halaman utama jika berhasil
async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true
  error.value = ''
  try {
    // Memanggil fungsi login dengan email dan password
    await login(payload.data.email, payload.data.password)
    // Menampilkan toast sukses dan mengarahkan ke dashboard
    toast.add({ title: 'Berhasil masuk', description: 'Mengalihkan ke dashboard...', color: 'success' })
    await navigateTo('/')
  } catch (e: any) {
    // Menampilkan pesan error jika login gagal
    error.value = e?.data?.statusMessage || 'Email atau kata sandi salah'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- Container utama halaman login dengan gradien background -->
  <div class="min-h-screen flex flex-col items-center justify-center bg-default p-4">
    <!-- Kartu formulir autentikasi -->
    <UPageCard class="relative z-10 w-full max-w-sm">
      <!-- Formulir autentikasi dari Nuxt UI dengan skema validasi dan field -->
      <UAuthForm
        :schema="schema"
        :fields="fields"
        title="SI Kinerja"
        description="Sistem Informasi Kegiatan Pelayanan Dapodik"
        :loading="loading"
        :validate-on="['submit', 'change']"
        :submit="{ label: 'Masuk', block: true, icon: 'i-lucide-arrow-right', trailing: true }"
        @submit="onSubmit"
      >
        <!-- Slot validasi untuk menampilkan pesan error -->
        <template #validation>
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            icon="i-lucide-circle-x"
            :title="error"
          />
        </template>
      </UAuthForm>
    </UPageCard>

    <!-- Informasi institusi di bagian bawah -->
    <div class="mt-6 text-center">
      <p class="text-sm leading-relaxed text-muted">UPTD Tekkomdik - Dinas Pendidikan dan Kebudayaan</p>
      <p class="text-sm leading-relaxed text-muted">Provinsi Nusa Tenggara Timur &copy; 2026</p>
    </div>
  </div>
</template>
