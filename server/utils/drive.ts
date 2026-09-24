import { getAccessToken } from './google'

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID

export async function uploadFile(
  file: File,
  fileName: string,
): Promise<{ id: string; name: string; mimeType: string; size: number }> {
  const accessToken = await getAccessToken()

  const metadata = {
    name: fileName,
    parents: [FOLDER_ID],
  }

  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', file)

  const upload = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form as any,
  })

  if (!upload.ok) {
    const text = await upload.text()
    throw new Error(`Drive upload failed: ${upload.status} ${text}`)
  }

  const data = await upload.json()

  return {
    id: data.id,
    name: data.name,
    mimeType: data.mimeType,
    size: data.size ?? 0,
  }
}

export async function getFileMetadata(fileId: string) {
  const accessToken = await getAccessToken()

  const response = await $fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webViewLink,webContentLink`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return response
}

export async function downloadFile(fileId: string): Promise<Blob> {
  const accessToken = await getAccessToken()

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Drive download failed: ${response.status}`)
  }

  return response.blob()
}
