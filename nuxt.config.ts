// Konfigurasi utama aplikasi Nuxt 4 — mendefinisikan pengaturan kompatibilitas, modul, CSS, dan variabel konfigurasi runtime
export default defineNuxtConfig({
  // Tanggal kompatibilitas fitur Nuxt — menentukan versi baseline yang digunakan oleh framework
  compatibilityDate: '2025-07-15',
  // Mengaktifkan panel devtools untuk debugging pengembangan
  devtools: { enabled: true },
  // Modul resmi yang diimpor — @nuxt/ui menyediakan komponen antarmuka pengguna Si Kinerja
  modules: ['@nuxt/ui'],
  // File CSS global yang diterapkan ke seluruh aplikasi — styles dasar Si Kinerja
  css: ['~/assets/css/main.css'],
  // Konfigurasi runtime — variabel lingkungan yang tersedia di server dan client
  runtimeConfig: {
    // Secret session untuk mengautentikasi pengguna dalam sesi
    sessionSecret: '',
    // URL database Turso — koneksi ke database SQLite yang dihosting
    tursoDatabaseUrl: '',
    // Token autentikasi Turso — akses ke database Turso
    tursoAuthToken: '',
    // Client ID Google OAuth — identitas aplikasi untuk autentikasi Google
    googleClientId: '',
    // Client Secret Google OAuth — kredensial rahasia untuk verifikasi Google
    googleClientSecret: '',
    // Refresh Token Google — token untuk memperbarui akses tanpa login ulang
    googleRefreshToken: '',
    // ID folder Google Drive — lokasi folder tempat bukti (evidence) disimpan
    googleDriveFolderId: '',
    // Ukuran maksimum unggahan file dalam byte (10 MB)
    uploadMaxSize: 10485760,
    // Tipe MIME yang diizinkan untuk unggahan file — PDF, JPEG, dan PNG saja
    uploadAllowedMimeTypes: 'application/pdf,image/jpeg,image/png',
    // Nama instance aplikasi — identitas organisasi UPTD Tekkomdik
    appInstanceName: 'UPTD Tekkomdik',
    // Konfigurasi publik yang dapat diakses oleh client-side
    public: {
      // Nama aplikasi yang ditampilkan kepada pengguna — SI Kinerja
      appName: 'SI Kinerja',
    },
  },
})
