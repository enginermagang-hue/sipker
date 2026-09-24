import { getAccessToken } from '#server/utils/google'
import { downloadFile } from '#server/utils/drive'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing evidence id' })
  }

  const accessToken = await getAccessToken()

  const metadata = await $fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=id,name,mimeType,size`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const blob = await downloadFile(id)

  setHeader(event, 'Content-Type', metadata.mimeType || 'application/octet-stream')
  setHeader(event, 'Content-Length', String(metadata.size ?? blob.size))
  setHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(metadata.name || 'download')}"`)

  return blob
})
