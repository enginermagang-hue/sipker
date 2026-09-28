<script setup lang="ts">
import * as z from 'zod'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({ layout: false })

const { login } = useAuth()
const toast = useToast()

const error = ref('')
const loading = ref(false)

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

const schema = z.object({
  email: z.string({ error: () => 'Email wajib diisi' }).email('Email tidak valid'),
  password: z.string({ error: () => 'Kata sandi wajib diisi' }).min(1, 'Kata sandi wajib diisi')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true
  error.value = ''
  try {
    await login(payload.data.email, payload.data.password)
    toast.add({ title: 'Berhasil masuk', description: 'Mengalihkan ke dashboard...', color: 'success' })
    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Email atau kata sandi salah'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-default p-4">
    <UPageCard class="relative z-10 w-full max-w-sm">
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

    <div class="mt-6 text-center">
      <p class="text-sm leading-relaxed text-muted">UPTD Tekkomdik - Dinas Pendidikan dan Kebudayaan</p>
      <p class="text-sm leading-relaxed text-muted">Provinsi Nusa Tenggara Timur &copy; 2026</p>
    </div>
  </div>
</template>

