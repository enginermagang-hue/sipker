export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    sessionSecret: '',
    tursoDatabaseUrl: '',
    tursoAuthToken: '',
    googleClientId: '',
    googleClientSecret: '',
    googleRefreshToken: '',
    googleDriveFolderId: '',
    uploadMaxSize: 10485760,
    uploadAllowedMimeTypes: 'application/pdf,image/jpeg,image/png',
    appInstanceName: 'UPTD Tekkomdik',
    public: {
      appName: 'SI Kinerja',
    },
  },
})
