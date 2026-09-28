// Mendapatkan access token Google OAuth2 menggunakan refresh token
// Return: Promise<string> yang berisi access token untuk autentikasi Google API
// Throw: Error jika variabel lingkungan OAuth2 tidak dikonfigurasi
export async function getAccessToken(): Promise<string> {
  // Ambil kredensial dari variabel lingkungan
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  // Validasi bahwa semua variabel lingkungan yang dibutuhkan tersedia
  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Missing Google Drive OAuth environment variables')
  }

  // Minta access token baru dari Google OAuth2 menggunakan refresh token
  const response = await $fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    },
  })

  // Kembalikan access token dari respons
  return response.access_token as string
}
