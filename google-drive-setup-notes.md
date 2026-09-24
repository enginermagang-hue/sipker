# Setup Google Drive API — Project SI Kinerja

Ringkasan percakapan tentang setting Google Drive API untuk project ini.

---

## 1) Kendala Organization Policy

- Saat mencoba membuat service account key (JSON), muncul warning:
  - "An Organization Policy that blocks service accounts key creation has been enforced on your organization."
- Penyebab: organisasi Google Cloud membatasi pembuatan service account key untuk keamanan.
- Akibat: tidak bisa menggunakan service account + JSON key seperti rencana awal di `PLAN.md`.

---

## 2) Alternatif yang Dipilih: OAuth 2.0 dengan Akun Khusus Aplikasi

- Akun Gmail khusus aplikasi: `enginermagang@gmail.com` (dibuat sendiri, bukan Google Workspace organisasi).
- Menggunakan OAuth 2.0 untuk mendapatkan refresh token, yang kemudian disimpan sebagai environment variable.

---

## 3) Kendala OAuth Consent Screen

- Saat authorize, muncul: "Akses diblokir: Si-Kinerja hanya dapat digunakan dalam organisasinya"
- Penyebab: OAuth consent screen masih bertipe **Internal**, sehingga hanya akun di dalam organisasi yang bisa authorize.
- Solusi: ubah consent screen menjadi **External**.

---

## 4) Kendala Verifikasi Google

- Setelah ubah ke External, muncul: "Akses diblokir: Si-Kinerja belum menyelesaikan proses verifikasi Google"
- Penyebab: aplikasi masih dalam mode **Testing** (belum verifikasi Google), dan akun yang dipakai belum didaftarkan sebagai **test user**.
- Solusi: tambahkan `enginermagang@gmail.com` sebagai test user di OAuth consent screen.
- Catatan: untuk MVP internal UPTD, mode Testing + test user sudah cukup; verifikasi Google tidak diperlukan sampai aplikasi dipakai oleh banyak pengguna eksternal.

---

## 5) Generate Refresh Token

Setelah test user ditambahkan, OAuth flow berhasil:

- Buka: `http://localhost:3000/api/drive/auth`
- Login dengan `enginermagang@gmail.com`
- Setelah authorize, di-redirect ke `/api/drive/callback` dan mendapatkan:
  - `refresh_token`: <REDACTED - disimpan di Vercel env var>
  - `access_token`: `ya29.a0AX07C...`
  - `expires_in`: 3599 (1 jam)
  - `scope`: `https://www.googleapis.com/auth/drive.file`
  - `token_type`: `bearer`

---

## 6) Penjelasan `expires_in: 3599`

- Access token aktif selama **3599 detik ≈ 1 jam**.
- Refresh token **tidak kedaluwarsa** kecuali:
  - Akun tidak digunakan selama 6 bulan
  - Revoke akses dari Google Account settings
  - Kadang-kadang jika password akun diubah
- Implementasi `server/utils/google.ts` sudah menangani refresh otomatis: setiap kali `getAccessToken()` dipanggil, ia menukar refresh token dengan access token baru.

---

## 7) Test Koneksi Google Drive

- Setelah simpan refresh token, test koneksi dengan endpoint `/api/drive/test`.
- Hasil:
  - ✅ Access token berhasil di-generate
  - ✅ Akun ter-autentikasi: `Enginer Magang` (`enginermagang@gmail.com`)
  - ✅ Upload file test ke Drive berhasil
  - ❌ Metadata folder gagal dengan 404 (kemungkinan karena folder di "Shared with me", bukan "My Drive")
  - ✅ Upload tetap berjalan normal

---

## 8) File yang Ditambahkan/Diubah

### File Baru
- `server/utils/google.ts` — helper tukar refresh token → access token
- `server/utils/drive.ts` — helper upload/download Drive
- `server/api/activities/[id]/evidence.ts` — endpoint upload bukti kegiatan
- `server/api/evidence/[id]/download.ts` — endpoint download bukti

### File Dihapus (endpoint sementara OAuth)
- `server/api/drive/auth.ts`
- `server/api/drive/callback.ts`
- `server/api/drive/test.ts`

### File Diubah
- `nuxt.config.ts` — tambah `googleDriveRedirectUri` (kemudian dihapus lagi)
- `.env` — tambah:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REFRESH_TOKEN`
  - `GOOGLE_DRIVE_FOLDER_ID`
  - `GOOGLE_DRIVE_REDIRECT_URI`

---

## 9) Catatan Keamanan

- File `.env` sudah di-`.gitignore`, jangan commit kredensial ke repo.
- Simpan `GOOGLE_REFRESH_TOKEN` sebagai Vercel environment variable untuk production.
- Jangan expose `GOOGLE_CLIENT_SECRET` atau `GOOGLE_REFRESH_TOKEN` ke frontend.
- Jika refresh token bocor, revoke akses dari Google Account settings dan buat token baru.

---

## 10) Langkah Selanjutnya

Endpoint upload/download yang baru dibuat **belum memiliki autentikasi dan otorisasi**. Langkah selanjutnya:
1. Tambahkan validasi sesi/login
2. Tambahkan cek role + region
3. Tambahkan validasi activity ownership
4. Simpan metadata evidence ke database Turso
5. Hapus file test dari Drive (`test-upload.txt`)

---

Percakapan ini disimpan pada: 2026-09-24
