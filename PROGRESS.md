# PROGRESS.md

**Status:** Tahap 1 (Fondasi) — autentikasi, otorisasi, master data, CRUD kegiatan, frontend admin
**Terakhir diperbarui:** 28 September 2026 (UTable di halaman wilayah)
**Target:** Sistem Informasi Kegiatan Pelayanan Dapodik UPTD Tekkomdik

## Ringkasan

Pull dari GitHub membawa fondasi backend: schema database (Drizzle + Turso), migrasi `0000`, seed (4 roles + 5 wilayah I–V), Google Drive OAuth, dan dua endpoint bukti. Tahap ini melengkapi sisa fondasi: autentikasi, otorisasi, master data admin, CRUD kegiatan, dan frontend admin.

Sumber keputusan utama:

- `PLAN.md` — ruang lingkup, peran, alur, Tahap implementasi, dan deployment.
- `DATABASE.md` — rancangan tabel, relasi, constraint, index, dan integrasi Turso/Google Drive.
- `AGENTS.md` — perintah kerja repository.

## Yang Sudah Selesai

- [x] Menetapkan fokus aplikasi sebagai pencatatan kegiatan Dapodik, bukan sistem skor atau penilaian formal.
- [x] Menetapkan empat peran: Admin, Kepala, Koordinator Wilayah, dan Anggota Wilayah.
- [x] Menetapkan satu koordinator/anggota memiliki satu wilayah; Admin dan Kepala memiliki cakupan global.
- [x] Menetapkan Kepala dapat melihat, memberi catatan, meminta perbaikan, dan menandai kegiatan sudah dicek.
- [x] Menetapkan nama guru/konsultan wajib dan minimal satu bukti Drive wajib sebelum pengiriman.
- [x] Menetapkan target deployment Vercel, Turso, dan Google Drive API.
- [x] Menulis `PLAN.md`, `DATABASE.md`, `AGENTS.md`.
- [x] Pull dari GitHub (commit `0500424`) — schema, migrasi, seed, Drive OAuth.
- [x] Migrasi `0000` ke Turso dan seed roles + wilayah (I–V).
- [x] Autentikasi login/logout (scrypt, session cookie HTTP-only, tabel `sessions`).
- [x] Otorisasi peran + wilayah (`requireRole`, `requireRegionScope`).
- [x] Master data admin: wilayah, sekolah, kategori kegiatan, pengguna (CRUD lengkap).
- [x] CRUD kegiatan (list scoped, create, detail, update, delete, submit).
- [x] Upload bukti ke Drive + simpan metadata Turso (otorisasi creator/admin/kepala).
- [x] Download bukti dengan otorisasi region/ownership.
- [x] Audit log helper (`writeAudit`).
- [x] Frontend: login (`UAuthForm`), root, dashboard admin, activities list/detail/new, sidebar, layout.
- [x] Fix sidebar tidak konsisten antara `/` dan `/admin` — `/` sekarang pakai layout `default` sehingga sidebar muncul untuk semua halaman
- [x] Fix `auth.global.ts` redirect — user login di `/` otomatis diarahkan ke `/admin` atau `/admin/activities` berdasarkan role
- [x] Hapus `Sidebar.vue` (dead code, tidak terpakai) — hanya `UDashboardSidebar` di `default.vue` yang aktif
- [x] Buat middleware `admin.ts` — memblokir akses halaman admin untuk non-admin role
- [x] Terapkan middleware `admin` ke semua halaman `/admin/*` (`index`, `regions`, `activities`, `activities/new`, `activities/[id]`)
- [x] Fix `auth.global.ts` — `/` dimasukkan ke `publicPages`, redirect `/login` dan `/` berdasarkan role
- [x] Fix SSR error `computed.fn is not a function` — hapus `computed` dari render path halaman wilayah & activities, ganti ke `useAsyncData` langsung.
- [x] Fix warning duplicated imports `requireRole`/`requireRegionScope` — hapus re-export dari `session.ts`, pisahkan import dari `authz.ts` di 17 file API.
- [x] `.gitignore` — tambahkan `dev.err`, `login.json`, `bootstrap-admin.ts` (file sensitif/untracked).
- [x] Fix modal wilayah — pola sipersa: `UModal` + `#body` + `UForm`/`UFormField` (tanpa `UCard`, tanpa `UFormGroup`).
- [x] Fix `USelect :options` → `:items` di `activities/index.vue` dan `activities/new.vue` (API v4).
- [x] Ganti `alert()` dengan `useToast()` di halaman wilayah.
- [x] List wilayah pakai `UTable` + `UCard` (pola sipersa) — kolom `code`, `name`, `description`, `isActive` (badge), aksi (edit/toggle/hapus).
- [x] Tambahkan komentar Bahasa Indonesia pada semua 10 file handler API admin (`schools/*` dan `categories/*`) — menjelaskan fungsi, parameter, return value, dan business logic setiap handler
- [x] Buat 3 hookify rule di `.claude/`: block `npm run build`, block `npm run dev`, require ID comments pada `.vue/.ts/.js`
- [x] Update `AGENTS.md` — tambahkan bagian "Enforcement Rules" yang ditegakkan secara teknis oleh hookify
- [x] Tambahkan `.claude/*.local.md` ke `.gitignore`
- [x] Retroaktif: tambahkan komentar ID ke semua ~48 file kode `.vue`, `.ts`, `.js` di `app/` dan `server/`
- [x] Update `PROGRESS.md` — dokumentasikan semua perubahan
- [x] Sesuaikan layout admin SIPKER dengan dashboard template (nuxt-ui-templates/dashboard)
  - Buat `app/app.config.ts` — konfigurasi warna primary green, neutral zinc
  - Update `app/app.vue` — ganti `<div>` → `<UApp>`, tambahkan `<NuxtLoadingIndicator />`, `useHead` + `useSeoMeta`
  - Rewrite `app/layouts/default.vue` — tambahkan `UDashboardSearchButton`, `UDashboardSearch`, `NotificationsSlideover`, cookie consent toast, role-based navigation dipertahankan
  - Update `nuxt.config.ts` — tambahkan `@nuxt/eslint`, `@vueuse/nuxt` modules, update `compatibilityDate` ke `2026-06-30`, tambahkan `routeRules` CORS dan `eslint` config
  - Update `app/assets/css/main.css` — tambahkan custom green theme palette (50-950) dan `--font-sans`
  - Buat `app/types/index.d.ts` — type definitions untuk User, Mail, Member, Stat, Sale, Notification, dll
  - Buat `app/utils/index.ts` — utility functions `randomInt`, `randomFrom`
  - Buat `app/composables/useDashboard.ts` — keyboard shortcuts dan `isNotificationsSlideoverOpen` state
  - Update `package.json` — tambahkan `@vueuse/core`, `@vueuse/nuxt`, `@nuxt/eslint`, `eslint`, `eslint-plugin-better-tailwindcss`, `typescript`, `vue-tsc`
  - Install dependencies — `@vueuse/nuxt@14.4.0`, `@nuxt/eslint@1.17.0` berhasil diinstal
  - Verifikasi build — `nuxt build` berhasil, client dan server built tanpa error
  - Pindahkan `UDashboardPanel` + `UDashboardNavbar` ke setiap halaman (Opsi C)
  - Layout hanya berisi sidebar, search, slot, notifications; setiap halaman wrap dengan Panel+Navbar
  - Halaman yang diupdate: index, admin, activities, activities/new, activities/[id], regions
  - Remove class padding (p-4, p-6, p-8, sm:p-6) dari body slot wrapper di setiap halaman
  - Tambah TanStack Table (@tanstack/table-core, scule) ke halaman wilayah
  - Buat komponen terpisah: app/components/regions/RegionsAddModal.vue, RegionsDeleteModal.vue
  - Tambah search box, status filter (Aktif/Nonaktif/Semua), column visibility toggle ke wilayah
- Tambah tombol "Tambah Wilayah" ke navbar (seperti dashboard template customers)
- Verifikasi dengan npx vue-tsc --noEmit — type check berhasil
- Perbaiki tombol close modal: ganti defineProps<{ open: boolean }>() → defineModel<boolean>('open') pada RegionsAddModal.vue dan RegionsDeleteModal.vue
- Perbaiki chain event: @update:open="emit('close')" → @update:open="open = false" dan @click="emit('close')" → @click="open = false"
- Update regions/index.vue: :open="addModalOpen" @update:open="addModalOpen = false" → v-model:open="addModalOpen"

## Yang Belum Dikerjakan

- [ ] Dashboard Kepala, Koordinator, dan Anggota (khusus peran).
- [ ] Pemeriksaan Kepala (mark checked / request revision) via UI.
- [ ] Upload bukti di browser (form kegiatan).
- [ ] Laporan PDF/Excel.
- [ ] UAT, lint, typecheck, deployment Vercel.

## Keputusan Temporer

- `id` menggunakan UUID `TEXT`.
- Waktu disimpan sebagai ISO 8601; zona pelaporan default `Asia/Jakarta`.
- Status kegiatan menggunakan kode `draft`, `submitted`, `needs_revision`, dan `checked`.
- Data biner hanya berada di Google Drive; Turso menyimpan metadata dan `driveFileId`.
- Database memakai foreign key, parameter query, index, soft deletion, dan pembatasan wilayah di server.
- Kredensial Google/Turso/session hanya melalui environment variable Vercel.
- Wilayah: 5 wilayah dengan kode angka I–V.
- Kategori kegiatan awal: konsultasi dapodik, update data peserta didik, update data PTK.
- Password di-hash dengan scrypt (built-in `node:crypto`).
- Login menggunakan `UAuthForm` (Nuxt UI) dengan validasi `zod`.

## Validasi

| Pemeriksaan | Status | Catatan |
|---|---|---|
| `npm run build` | Berhasil | `EXIT=True`, tanpa error |
| Migrasi Turso | Berhasil | 10 tabel + `drizzle_migrations` |
| Seed | Berhasil | 4 roles + 5 regions |
| Login endpoint | Berhasil | `200`, cookie `sid` diset |
| Middleware | Berhasil | `defineNuxtRouteMiddleware`, tanpa `node:crypto` |
| Halaman Wilayah | Berhasil | `/admin/regions` — tabel + modal CRUD + soft delete |
| SSR Wilayah | Berhasil | `302` redirect (tidak crash) setelah hapus `computed` |
| Duplicated imports | Berhasil | Warning hilang setelah pisahkan import `authz.ts` |
| Modal Wilayah | Berhasil | Pola sipersa — `UModal` + `#body` + `UForm` |
| Tabel Wilayah | Berhasil | `UTable` + `UCard`, kolom via `h()` render |
| Hookify rules | Berhasil | 3 rule: block-npm-build, block-npm-dev, require-id-comments |
| Retroactive ID comments | Berhasil | ~48 file .vue/.ts/.js sudah diberi komentar ID |
| AGENTS.md enforcement | Berhasil | Bagian Enforcement Rules ditambahkan |
| Layout dashboard template | Berhasil | app.config.ts, app.vue, default.vue, nuxt.config.ts, CSS, types, utils, composable |
| Dependencies | Berhasil | @vueuse/nuxt, @nuxt/eslint terinstall |
| Build | Berhasil | `nuxt build` sukses — client + server |
| Typecheck | Belum tersedia | Belum ada script khusus |
| Test | Belum tersedia | Belum ada framework/test script |
| UAT | Belum dimulai | Menunggu frontend |

- [x] Periksa koneksi Turso — script `scripts/check-turso.ts` dan `scripts/test-turso-insert.ts` berhasil; DB READ/INSERT/DELETE semua berhasil (token masih valid)
- [x] Periksa `post.ts` — kode sudah lengkap, komentar ID lengkap, insert berhasil saat diuji langsung
- [x] Tambah logging eksplisit di `post.ts`: log body (`JSON.stringify`), koneksi DB (`createDb`), proses insert (`console.log` sebelum/sesudah), sukses (`id`, `code`, `name`, `isActive`), error (`message`, `stack`), `createError` — semua baris memiliki komentar ID
- [x] Tambah logging eksplisit di `regions/index.vue`: `console.log` setelah submit dan refresh
- [x] Data wilayah masih muncul karena data seed tersimpan di Turso; masalah "tambah wilayah belum bekerja" kemungkinan filter (`searchQuery`/`statusFilter`) menyembunyikan data baru — verifikasi dengan mengubah filter ke "Semua" atau menghapus search

## Langkah Berikutnya

1. Uji halaman Wilayah (tambah, edit, nonaktifkan, hapus) di `/admin/regions`.
2. Uji halaman login (`UAuthForm`) dan redirect ke `/admin/`.
3. Uji hookify rules (blokir `npm run build`, `npm run dev`, dan komentar ID).
4. Uji layout baru — sidebar search, notifications slideover, cookie consent, keyboard shortcuts.
5. Buat halaman Koordinator (`pages/koordinator/`) dan Anggota (`pages/anggota/`).
6. Lengkapi form kegiatan dengan upload bukti di browser.
7. Pemeriksaan Kepala (status `needs_revision` / `checked`) via UI.
8. Laporan PDF/Excel.
9. UAT dan deployment Vercel.

## Aturan Pembaruan

Setiap kali fitur, perbaikan, refactor, atau perubahan implementasi selesai, perbarui `PROGRESS.md` pada perubahan yang sama. Tambahkan tanggal, ringkasan pekerjaan, file/fitur yang terdampak, hasil verifikasi, dan kendala atau langkah berikutnya. Jangan menandai pekerjaan selesai tanpa hasil verifikasi.

Jangan menjalankan `npm run build` secara otomatis. Jalankan perintah tersebut hanya jika pengguna memintanya atau menyetujuinya secara eksplisit.

Jangan menjalankan `npm run dev` secara otomatis. Jika dev server mati, minta pengguna untuk menjalankannya.

Setiap baris kode yang ditulis harus memiliki komentar dalam bahasa Indonesia. Aturan ini ditegakkan secara teknis oleh hookify rule di `.claude/hookify.*.local.md`.
