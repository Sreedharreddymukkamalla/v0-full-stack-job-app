import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
    })
  }

  try {
    const filename = `${uuidv4()}-${file.name}`
    const blob = await put(filename, file, { access: 'private' })

    return new Response(
      JSON.stringify({
        url: blob.url,
        filename: file.name,
        size: file.size,
        type: file.type,
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('File upload error:', error)
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
    })
  }
}
