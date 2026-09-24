# PROGRESS.md

**Status:** Dokumentasi dan fondasi aplikasi
**Terakhir diperbarui:** 24 September 2026
**Target:** Sistem Informasi Kegiatan Pelayanan Dapodik UPTD Tekkomdik

## Ringkasan

Repositori masih berupa starter Nuxt 4. Belum ada fitur aplikasi, API, autentikasi, database, migrasi, server route, pengujian, atau konfigurasi deployment yang diimplementasikan.

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
- [x] Menulis `PLAN.md`.
- [x] Menulis `DATABASE.md`.
- [x] Menulis `AGENTS.md`.
- [x] Menjalankan `npm run build` dengan sukses.

## Yang Belum Dikerjakan

- [ ] Setup backend/server routes Nuxt.
- [ ] Autentikasi, sesi, dan pembatasan role/wilayah.
- [ ] Koneksi Turso dan migrasi database.
- [ ] Master pengguna, wilayah, sekolah, dan kategori.
- [ ] Form kegiatan dan upload bukti Google Drive.
- [ ] Dashboard Kepala, Koordinator, dan Anggota.
- [ ] Status pemeriksaan, catatan, dan audit log.
- [ ] Laporan PDF/Excel.
- [ ] Test, lint, typecheck, UAT, dan deployment Vercel.

## Keputusan Temporer

- `id` menggunakan UUID `TEXT`.
- Waktu disimpan sebagai ISO 8601; zona pelaporan default `Asia/Jakarta`.
- Status kegiatan menggunakan kode `draft`, `submitted`, `needs_revision`, dan `checked`.
- Data biner hanya berada di Google Drive; Turso menyimpan metadata dan `driveFileId`.
- Database harus memakai foreign key, parameter query, index, soft deletion, dan pembatasan wilayah di server.
- Kredensial Google/Turso/session hanya melalui environment variable Vercel.

## Validasi

| Pemeriksaan | Status | Catatan |
|---|---|---|
| `npm run build` | Berhasil | Hanya warning deprecation dari dependency Nuxt Icon |
| Lint | Belum tersedia | Belum ada script/configuration |
| Typecheck | Belum tersedia | Belum ada script khusus |
| Test | Belum tersedia | Belum ada framework/test script |
| UAT | Belum dimulai | Menunggu implementasi fitur |

## Langkah Berikutnya

1. Tetapkan daftar final kategori kegiatan dan contoh form.
2. Siapkan project Turso development, account Google Drive khusus, dan folder bukti.
3. Tambahkan konfigurasi environment dan koneksi Turso.
4. Susun migrasi awal sesuai `DATABASE.md`.
5. Implementasikan autentikasi dan pembatasan role/wilayah.
6. Bangun master data sebelum form kegiatan.

## Aturan Pembaruan

Setiap kali fitur, perbaikan, refactor, atau perubahan implementasi selesai, perbarui `PROGRESS.md` pada perubahan yang sama. Tambahkan tanggal, ringkasan pekerjaan, file/fitur yang terdampak, hasil verifikasi, dan kendala atau langkah berikutnya. Jangan menandai pekerjaan selesai tanpa hasil verifikasi.

Jangan menjalankan `npm run build` secara otomatis. Jalankan perintah tersebut hanya jika pengguna memintanya atau menyetujuinya secara eksplisit.
