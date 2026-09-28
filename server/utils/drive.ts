import { getAccessToken } from './google'

// ID folder Google Drive tempat file-file diunggah
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID

// Mengunggah file ke Google Drive ke folder yang ditentukan
// Parameter: file - objek File yang akan diunggah
// Parameter: fileName - nama file yang akan disimpan di Drive
// Return: Promise berisi objek dengan id, name, mimeType, dan size file yang diunggah
export async function uploadFile(
  file: File,
  fileName: string,
): Promise<{ id: string; name: string; mimeType: string; size: number }> {
  // Dapatkan access token untuk autentikasi API
  const accessToken = await getAccessToken()

  // Buat metadata file termasuk nama dan folder tujuan
  const metadata = {
    name: fileName,
    parents: [FOLDER_ID],
  }

  // Buat FormData dengan metadata JSON dan file untuk upload multipart
  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', file)

  // Kirim permintaan upload ke Google Drive API v3
  const upload = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form as any,
  })

  // Tangani kesalahan jika upload gagal
  if (!upload.ok) {
    const text = await upload.text()
    throw new Error(`Drive upload failed: ${upload.status} ${text}`)
  }

  // Parsis respons JSON untuk mendapatkan detail file
  const data = await upload.json()

  // Kembalikan informasi file yang berhasil diunggah
  return {
    id: data.id,
    name: data.name,
    mimeType: data.mimeType,
    size: data.size ?? 0,
  }
}

// Mengambil metadata file dari Google Drive berdasarkan ID file
// Parameter: fileId - ID unik file di Google Drive
// Return: Promise berisi objek metadata file (id, name, mimeType, size, dll.)
export async function getFileMetadata(fileId: string) {
  // Dapatkan access token untuk autentikasi API
  const accessToken = await getAccessToken()

  // Minta metadata file dari Google Drive API dengan field-field tertentu
  const response = await $fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webViewLink,webContentLink`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return response
}

// Mengunduh file dari Google Drive sebagai Blob
// Parameter: fileId - ID unik file di Google Drive
// Return: Promise<Blob> berisi konten file yang diunduh
// Throw: Error jika proses pengunduhan gagal
export async function downloadFile(fileId: string): Promise<Blob> {
  // Dapatkan access token untuk autentikasi API
  const accessToken = await getAccessToken()

  // Kirim permintaan download ke Google Drive API dengan parameter alt=media untuk konten biner
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  // Tangani kesalahan jika download gagal
  if (!response.ok) {
    throw new Error(`Drive download failed: ${response.status}`)
  }

  // Kembalikan file sebagai Blob
  return response.blob()
}
