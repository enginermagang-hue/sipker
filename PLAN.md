# Rencana Implementasi Sistem Informasi Kegiatan Pelayanan Dapodik UPTD Tekkomdik

**Status:** Draft
**Nama kerja aplikasi:** SI Kinerja — Sistem Informasi Kegiatan Pelayanan Dapodik
**Target implementasi:** 4 wilayah, 10–16 pengguna
**Prioritas:** Tidak mendesak; pengembangan dapat dilakukan bertahap

## 1. Ringkasan

Aplikasi ini akan menjadi sistem internal untuk mencatat kegiatan pelayanan Dapodik yang dilakukan oleh koordinator wilayah dan anggota wilayah. Koordinator dapat melihat kegiatan di wilayahnya, sedangkan anggota dapat melihat kegiatannya sendiri. Kepala dapat melihat kegiatan seluruh staf pada sekolah, guru, atau pihak yang berkonsultasi.

Aplikasi **tidak menghitung nilai kinerja, tidak menggunakan bobot atau ranking, dan tidak menghasilkan penilaian formal**. Fokus utama aplikasi adalah menyediakan catatan kegiatan yang lengkap, dapat dicari, memiliki bukti, dan dapat dipantau oleh Kepala.

## 2. Latar Belakang

Saat ini informasi kegiatan pelayanan Dapodik tersebar melalui pesan, catatan pribadi, atau laporan yang tidak terpusat. Sulit bagi Kepala untuk melihat:
- kegiatan yang dilakukan seluruh staf secara cepat;
- cakupan sekolah dan guru yang telah dilayani;
- kegiatan yang sudah dan belum diperiksa;
- bukti dokumentasi kegiatan secara aman;
- rekap kegiatan berdasarkan waktu, wilayah, sekolah, atau jenis layanan.

Aplikasi akan menyediakan satu sumber data untuk membantu Kepala memantau pelaksanaan kegiatan tanpa mengubahnya menjadi sistem penilaian kinerja.

## 3. Tujuan

1. Menyediakan tempat pencatatan kegiatan pelayanan Dapodik yang terstruktur.
2. Mempermudah Kepala melihat kegiatan seluruh staf.
3. Menyediakan dashboard, filter, pencarian, dan laporan.
4. Menyimpan setiap kegiatan beserta bukti dokumentasinya.
5. Menjaga data kegiatan hanya dapat diakses oleh pengguna yang berwenang.
6. Menyediakan riwayat perubahan dan pemeriksaan kegiatan.

## 4. Ruang Lingkup

### 4.1 Termasuk dalam MVP

- Login, logout, dan pengelolaan sesi.
- Manajemen pengguna dan pembagian peran.
- Manajemen wilayah dan penugasan satu pengguna ke satu wilayah.
- Data master sekolah dan kategori kegiatan.
- Form input kegiatan pelayanan Dapodik.
- Pencatatan nama guru/konsultan.
- Unggah minimal satu bukti ke Google Drive.
- Dashboard Kepala, Koordinator, dan Anggota.
- Filter, pencarian, serta paginasi.
- Pemeriksaan kegiatan oleh Kepala.
- Catatan pemeriksaan dan permintaan perbaikan.
- Ekspor laporan.
- Jejak audit.
- Pemasangan ke Vercel dengan database Turso.

### 4.2 Tidak Termasuk dalam MVP

- Perhitungan skor kinerja.
- Bobot KPI atau target individu.
- Ranking atau urutan staf.
- Penilaian formal.
- Absensi dan penggajian.
- Penugasan multi-wilayah.
- Aplikasi mobile native.
- Portal publik.
- Integrasi dengan sistem lain yang belum disebutkan.

## 5. Pengguna dan Hak Akses

### 5.1 Admin

Admin mengelola aplikasi dan data referensi. Admin tidak menggunakan dashboard sebagai pemeriksa kegiatan.

Hak akses:

- membuat, mengubah, menonaktifkan, dan mereset akun pengguna;
- menetapkan peran dan wilayah pengguna;
- mengelola master sekolah;
- mengelola kategori kegiatan;
- melihat seluruh data untuk keperluan dukungan;
- melihat audit log;
- mengatur parameter aplikasi yang disetujui.

### 5.2 Kepala

Kepala merupakan pemeriksa utama kegiatan.

Hak akses:

- melihat kegiatan seluruh wilayah;
- melakukan filter dan pencarian;
- membuka detail kegiatan dan bukti;
- memberi catatan pemeriksaan;
- menandai kegiatan sebagai **Sudah Dicek**;
- meminta perbaikan jika informasi atau bukti belum lengkap.

Kepala tidak mengubah isi kegiatan yang sudah dikirim. Koreksi isi dilakukan oleh pembuat kegiatan melalui status **Perlu Perbaikan** agar riwayat perubahan tetap jelas.

### 5.3 Koordinator Wilayah

Koordinator dapat melihat kegiatan di wilayahnya agar dapat memantau cakupan dan layanan.

Hak akses:

- melihat seluruh kegiatan pada wilayahnya;
- membuat kegiatan untuk dirinya sendiri;
- melihat detail dan bukti kegiatan wilayahnya;
- mengubah kegiatan miliknya selama belum dikunci oleh Kepala.

Koordinator bukan pemeriksa. Status pemeriksaan tetap dilakukan oleh Kepala.

### 5.4 Anggota Wilayah

Anggota hanya menangani kegiatannya sendiri.

Hak akses:

- melihat kegiatan miliknya;
- membuat kegiatan baru;
- mengubah atau menghapus kegiatan miliknya selama masih berstatus draft atau perlu perbaikan;
- mengunggah bukti;
- mengirim kegiatan untuk diperiksa;
- melihat catatan dan hasil pemeriksaan.

Anggota tidak dapat melihat, mengubah, atau menghapus kegiatan anggota lain.

## 6. Kebutuhan Fungsional

### 6.1 Autentikasi

- Login menggunakan email dan kata sandi.
- Password disimpan dalam bentuk hash yang aman.
- Sesi menggunakan cookie aman dan HTTP-only.
- Pengguna nonaktif tidak dapat login.
- Pengguna hanya dapat mengakses menu dan data sesuai peran dan wilayah.
- Pencatatan login, logout, dan perubahan penting masuk ke audit log.

### 6.2 Data Master

**Wilayah**

- nama wilayah;
- kode wilayah;
- status aktif.

**Sekolah**

- nama sekolah;
- wilayah sekolah;
- alamat atau keterangan;
- status aktif.

**Kategori Kegiatan**

Kategori dapat disesuaikan setelah ditetapkan. Contoh awal:

- konsultasi teknis Dapodik;
- pendampingan guru;
- verifikasi atau perbaikan data;
- pemecahan masalah (troubleshooting);
- pelatihan dan internalisasi;
- kunjungan atau monitoring;
- lainnya.

**Pengguna**

- nama;
- email;
- peran;
- wilayah;
- jabatan;
- status aktif.

### 6.3 Form Kegiatan

Setiap kegiatan minimal memiliki data berikut:

| Data | Keterangan |
|---|---|
| Tanggal dan waktu | Waktu kegiatan dilakukan |
| Sekolah | Sekolah yang dilayani |
| Nama guru/konsultan | Wajib diisi |
| Jabatan/keterangan konsultan | Opsional; dapat ditetapkan sebagai wajib |
| Kategori kegiatan | Pilihan dari master kategori |
| Topik konsultasi | Ringkasan masalah yang dibawa |
| Kegiatan/tindakan | Apa yang dilakukan petugas |
| Hasil/tindak lanjut | Hasil kegiatan dan langkah berikutnya |
| Catatan | Keterangan tambahan |
| Bukti | Minimal satu berkas untuk kegiatan yang dikirim |

Wilayah diambil dari akun pengguna dan tidak dapat diganti dari form. Server tetap memvalidasi bahwa sekolah berada di wilayah pengguna.

### 6.4 Bukti Google Drive

- Form menyimpan minimal satu bukti sebelum kegiatan dapat dikirim.
- Akun Google khusus aplikasi digunakan oleh server.
- Aplikasi tidak menautkan berkas secara publik.
- Metadata berkas disimpan di Turso.
- Ketika berkas dihapus di aplikasi, audit log menyimpan informasi bahwa berkas telah dihapus.
- Batas ukuran dan jenis berkas ditetapkan pada konfigurasi aplikasi.
- Endpoint server menyediakan akses berkas hanya setelah pemeriksaan peran dan wilayah.

### 6.5 Dashboard

Dashboard Kepala menampilkan:

- total kegiatan hari ini, minggu ini, bulan ini, dan periode terpilih;
- jumlah kegiatan per wilayah;
- jumlah kegiatan per sekolah;
- jumlah kegiatan per kategori;
- jumlah kegiatan menunggu pemeriksaan;
- jumlah kegiatan yang sudah dicek;
- grafik tren kegiatan;
- daftar kegiatan terbaru;
- daftar kegiatan yang perlu diperiksa.

Dashboard Koordinator menampilkan statistik kegiatan wilayahnya. Dashboard Anggota menampilkan riwayat kegiatan sendiri.

### 6.6 Filter dan Pencarian

Filter yang disediakan:

- rentang tanggal;
- wilayah;
- sekolah;
- kategori;
- nama guru/konsultan;
- status pemeriksaan;
- pengguna pembuat kegiatan.

### 6.7 Pemeriksaan Kepala

Status kegiatan:

1. **Draft** — sedang disusun dan masih dapat diubah pembuat.
2. **Menunggu Pemeriksaan** — sudah dikirim dan menunggu Kepala.
3. **Perlu Perbaikan** — Kepala meminta informasi/bukti tambahan.
4. **Sudah Dicek** — Kepala telah memeriksa kegiatan.

Aksi Kepala:

- membuka detail kegiatan;
- membaca seluruh kolom data dan bukti;
- menulis catatan;
- meminta perbaikan;
- menandai kegiatan selesai diperiksa.

### 6.8 Laporan

- Rekap kegiatan harian, mingguan, bulanan, dan tahunan.
- Rekap per wilayah, sekolah, kategori, dan pengguna.
- Laporan kegiatan yang sudah dan belum diperiksa.
- Ekspor Excel untuk rekap dan PDF untuk laporan siap cetak.
- Filter dan periode dapat dipilih sebelum ekspor.

## 7. Alur Proses

```text
Admin membuat wilayah, sekolah, pengguna, dan kategori
                         |
                         v
Anggota/Koordinator membuat kegiatan
                         |
                         v
Mengisi data dan mengunggah minimal satu bukti
                         |
                         v
Menyimpan draft atau mengirim untuk pemeriksaan
                         |
                         v
Kepala membuka detail kegiatan di dashboard
                         |
              +----------+-----------+
              |                      |
       Perlu Perbaikan         Sudah Dicek
              |                      |
       Pembuat memperbaiki       Aktivitas selesai dipantau
```

## 8. Model Data

| Entitas | Kegunaan |
|---|---|
| `users` | Akun, peran, wilayah, dan status pengguna |
| `roles` | Admin, Kepala, Koordinator, Anggota |
| `regions` | Data wilayah |
| `schools` | Data sekolah dan wilayah |
| `activity_categories` | Kategori kegiatan |
| `activities` | Data kegiatan dan status pemeriksaan |
| `evidence` | Metadata bukti di Google Drive |
| `activity_reviews` | Catatan, pemeriksa, waktu, dan hasil pemeriksaan |
| `audit_logs` | Riwayat perubahan penting |

### 8.1 Field Utama `activities`

- `id`
- `created_by`
- `region_id`
- `school_id`
- `category_id`
- `activity_at`
- `consultant_name`
- `consultant_position`
- `topic`
- `action_taken`
- `result`
- `follow_up`
- `notes`
- `status`
- `submitted_at`
- `checked_at`
- `checked_by`
- `review_note`
- `created_at`
- `updated_at`

### 8.2 Field Utama `evidence`

- `id`
- `activity_id`
- `drive_file_id`
- `file_name`
- `mime_type`
- `file_size`
- `uploaded_by`
- `created_at`

### 8.3 Aturan Integritas Data

- Setiap user hanya memiliki satu wilayah.
- Sekolah harus berada di wilayah yang sama dengan kegiatan.
- Nama guru/konsultan wajib diisi.
- Kegiatan yang dikirim harus memiliki minimal satu bukti.
- Data kegiatan tidak dapat dihapus permanen setelah diperiksa; perubahan harus tercatat.
- Status hanya dapat berubah melalui transisi yang valid.

## 9. Arsitektur Teknologi

### 9.1 Stack

- **Frontend:** Nuxt 4, Vue 3, TypeScript, Nuxt UI, Tailwind CSS.
- **Server/API:** Nuxt server routes/Nitro.
- **Database:** Turso menggunakan driver resmi Turso/libSQL.
- **ORM dan migrasi:** pilihan ORM TypeScript yang mendukung Turso; gunakan migrasi versioning.
- **Google Drive:** Google Drive API, diproses di sisi server.
- **Hosting:** Vercel.
- **Deployment:** preview untuk pengujian dan produksi untuk penggunaan.

### 9.2 Struktur Target

```text
app/
  pages/
  components/
  layouts/
  middleware/
  composables/
  types/
server/
  api/
  utils/
  database/
  services/
  middleware/
  plugins/
```

### 9.3 Integrasi Google Drive

Rencana konfigurasi:

1. Membuat project Google Cloud khusus aplikasi.
2. Mengaktifkan Google Drive API.
3. Membuat kredensial untuk satu akun khusus aplikasi.
4. Menyimpan kredensial/refresh token dan folder ID sebagai variabel lingkungan Vercel.
5. Mengunggah berkas melalui server ke folder aplikasi.
6. Menyimpan `driveFileId` dan metadata di Turso.
7. Mengunduh atau membuka berkas melalui endpoint server yang telah memeriksa peran dan wilayah.
8. Tidak membagikan folder atau berkas secara publik.

### 9.4 Lingkungan Produksi

Variabel lingkungan yang diperlukan:

- `DATABASE_URL` dan token Turso;
- rahasia sesi;
- kredensial Google Drive;
- folder ID Drive;
- konfigurasi batas upload;
- konfigurasi nama instansi dan aplikasi.

Tidak ada kredensial Google atau Turso yang disimpan di kode frontend.

## 10. Keamanan dan Privasi

- HTTPS untuk produksi.
- Otorisasi dilakukan pada server, bukan hanya pada tombol di frontend.
- Query database selalu membatasi data sesuai wilayah dan peran.
- ID file Google Drive tidak cukup untuk memperoleh akses; akses harus diverifikasi.
- Jangan menyimpan tautan publik sebagai akses utama.
- Batasi jenis dan ukuran berkas.
- Jangan menampilkan isi berkas sebagai HTML tanpa sanitasi.
- Catat login, perubahan data, perubahan status, upload, download, dan hapus.
- Gunakan backup Turso dan backup/retensi folder Drive.
- Terapkan prosedur jika ada akun pengguna yang meninggalkan sistem atau berubah peran.
- Data nama guru/konsultan diperlakukan sebagai data pribadi dan hanya ditampilkan kepada pengguna yang berwenang.

## 11. Struktur Menu

### Admin

- Dashboard
- Wilayah
- Sekolah
- Kategori Kegiatan
- Pengguna
- Audit Log
- Pengaturan

### Kepala

- Dashboard
- Semua Kegiatan
- Kegiatan Perlu Dicek
- Sudah Dicek
- Laporan

### Koordinator Wilayah

- Dashboard
- Kegiatan Wilayah
- Tambah Kegiatan
- Laporan

### Anggota Wilayah

- Dashboard
- Kegiatan Saya
- Tambah Kegiatan
- Riwayat

## 12. Tahapan Implementasi

| Tahap | Pekerjaan | Hasil |
|---|---|---|
| 0. Analisis | Memetakan alur, kategori, kolom data, dan contoh data | Dokumen kebutuhan dan wireframe awal |
| 1. Fondasi | Penyiapan aplikasi, layout, sesi, peran, dan database | Login dan otorisasi dasar |
| 2. Data Master | CRUD wilayah, sekolah, kategori, dan pengguna | Data acuan aplikasi |
| 3. Kegiatan | Formulir kegiatan, validasi, draft, dan pengiriman | Kegiatan dapat dicatat |
| 4. Drive | Integrasi upload, download, dan metadata bukti | Bukti tersimpan di Drive |
| 5. Dashboard | Dashboard dan filter sesuai peran | Kepala dapat memantau kegiatan |
| 6. Pemeriksaan | Status, catatan, dan permintaan perbaikan | Alur pemeriksaan Kepala |
| 7. Laporan | Rekap, PDF, Excel, dan audit | Laporan siap digunakan |
| 8. UAT | Pengujian oleh pimpinan dan staf UPTD | Perbaikan hasil UAT |
| 9. Deploy | Produksi Vercel, dokumentasi, dan pelatihan | Aplikasi siap digunakan |

## 13. Estimasi Waktu

Estimasi berikut mengasumsikan satu developer bekerja penuh waktu, data contoh tersedia, dan keputusan bisnis dapat diambil secara cepat.

| Tahap | Estimasi |
|---|---:|
| Analisis kebutuhan | 3–5 hari |
| Fondasi dan autentikasi | 1 minggu |
| Master data | 1 minggu |
| Form kegiatan | 1–2 minggu |
| Integrasi Google Drive | 1 minggu |
| Dashboard dan filter | 1 minggu |
| Pemeriksaan dan laporan | 1 minggu |
| UAT dan perbaikan | 1–2 minggu |
| Pemasangan dan pelatihan | 3–5 hari |
| **Total MVP** | **8–10 minggu** |

Karena proyek tidak mendesak, implementasi dapat menggunakan sprint 1–2 minggu. Jalur cepat dapat fokus pada kegiatan dasar tanpa laporan lanjutan, sedangkan laporan tambahan dapat dikembangkan setelah data nyata tersedia.

## 14. Strategi Pengujian

### 14.1 Pengujian Fungsional

- Login setiap peran.
- Admin dapat mengelola data.
- Anggota hanya dapat membuat kegiatan sendiri.
- Koordinator dapat melihat seluruh kegiatan wilayahnya.
- Kepala dapat melihat seluruh wilayah.
- Kegiatan memerlukan minimal satu bukti saat dikirim.
- Sekolah tidak dapat dipilih dari wilayah lain.
- Nama guru/konsultan wajib ada.
- Status hanya berubah sesuai transisi yang diizinkan.

### 14.2 Pengujian Integrasi

- Koneksi Turso.
- Migrasi database.
- Unggah, unduh, dan penghapusan metadata bukti.
- Pesan error Drive dan transaksi database.
- Pemulihan jika unggahan berhasil tetapi penyimpanan database gagal.
- Validasi ukuran dan jenis berkas unggahan.

### 14.3 Pengujian Keamanan

- Akses langsung ke URL kegiatan lain.
- Akses berkas Google Drive milik kegiatan lain.
- Percobaan mengubah peran atau wilayah.
- Validasi ID file yang dimanipulasi.
- Sesi logout dan cookie kedaluwarsa.
- Injeksi, XSS, dan berkas berbahaya.

### 14.4 UAT

Skenario minimum:

1. Anggota membuat kegiatan dan melampirkan bukti.
2. Kegiatan muncul di dashboard Koordinator.
3. Kegiatan hanya muncul di wilayah yang benar.
4. Kepala memberi catatan dan meminta perbaikan.
5. Anggota memperbaiki dan mengirim kembali.
6. Kepala menandai kegiatan sudah dicek.
7. Kepala mengunduh laporan dan bukti.

## 15. Pemasangan dan Operasional

- Gunakan branch pratinjau untuk pengujian.
- Gunakan environment produksi Vercel untuk aplikasi resmi.
- Simpan konfigurasi sensitif di Environment Variables Vercel.
- Lakukan backup dan ekspor Turso secara berkala.
- Uji pemulihan backup sebelum sistem digunakan penuh.
- Tetapkan pihak yang mengelola akun dan folder Drive.
- Dokumentasikan cara membuat pengguna, mengelola folder, dan memulihkan data.
- Pantau error server tanpa mencatat password, token, atau isi kredensial.

## 16. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Persyaratan lapangan berubah | Kunci MVP melalui konfirmasi dan wireframe |
| Bukti terlalu besar atau format tidak didukung | Tetapkan batas ukuran dan daftar format yang diizinkan |
| Akses Google Drive salah konfigurasi | Uji dengan akun khusus dan folder terisolasi |
| Data guru/konsultan bersifat sensitif | Batasi peran, gunakan HTTPS, jangan bagikan tautan publik |
| Server Vercel memiliki batasan permintaan | Batasi ukuran unggahan dan gunakan API di sisi server |
| Adopsi tidak konsisten | Sediakan pelatihan singkat, contoh formulir, dan panduan singkat |
| Perubahan data sulit ditelusuri | Jangan menghapus riwayat; gunakan audit log |
| Cakupan bertambah menjadi penilaian kinerja | Terapkan pengontrolan perubahan dan tumpukan pekerjaan terpisah |

## 17. Kemungkinan Pengembangan Selanjutnya

- Export dan laporan lanjutan.
- Filter berdasarkan guru/konsultan dan periode.
- Template kegiatan yang lebih cepat.
- Rekap per bulan dalam format Memorandum.
- Notifikasi internal saat kegiatan menunggu pemeriksaan.
- Ringkasan eksekutif untuk Kepala.
- Aplikasi mobile/PWA.
- Integrasi dengan sistem Dapodik atau aplikasi internal.
- Statistik cakupan sekolah dan jenis bantuan.

## 18. Keputusan yang Perlu Diselesaikan

Sebelum coding dimulai, keputusan berikut perlu dikonfirmasi:

1. Daftar final kategori kegiatan.
2. Apakah jabatan/NIP konsultan perlu menjadi kolom wajib atau opsional.
3. Batas ukuran dan jenis berkas bukti.
4. Apakah kegiatan yang sudah `Sudah Dicek` dapat diperbaiki atau hanya melalui revisi baru.
5. Apakah Admin boleh memperbaiki data pegawai tanpa meninggalkan audit.
6. Berapa lama data kegiatan dan bukti disimpan.
7. Apakah akun Google khusus aplikasi sudah dibuat atau perlu disiapkan.
8. Apakah diperlukan domain resmi UPTD Tekkomdik.

## 19. Definisi Selesai

MVP dianggap selesai bila:

- semua peran dapat login dan hanya melihat data yang diizinkan;
- Admin dapat mengelola seluruh data master;
- Koordinator dan anggota dapat menginput kegiatan sesuai wilayah;
- nama guru/konsultan tercatat;
- minimal satu bukti Drive wajib ada pada kegiatan yang dikirim;
- Kepala dapat melihat, memeriksa, memberi catatan, dan meminta perbaikan;
- dashboard dan filter bekerja;
- laporan PDF/Excel dapat diunduh;
- audit log mencatat perubahan penting;
- pengujian otomatis dan UAT selesai;
- produksi Vercel terpasang dan dapat diakses pengguna internal;
- dokumentasi penggunaan dan serah terima tersedia.

## 20. Rekomendasi Langkah Berikutnya

1. Mengumpulkan contoh kegiatan nyata.
2. Menetapkan daftar kategori dan kolom wajib.
3. Membuat wireframe dashboard Kepala dan form kegiatan.
4. Menyiapkan akun Google khusus aplikasi dan folder Drive.
5. Menyiapkan project Turso serta environment development.
6. Memulai Tahap 1 dengan autentikasi, peran, dan data master.
