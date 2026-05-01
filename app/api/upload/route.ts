import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const uploads: { name: string; url: string; field: string }[] = []

    console.log('Upload route hit')
    console.log('Form entries:', [...form.entries()].map(([k, v]) => ({
      field: k,
      type: v instanceof File ? 'File' : 'string',
      name: v instanceof File ? v.name : v,
      size: v instanceof File ? v.size : 0,
    })))

    for (const [field, value] of form.entries()) {
      if (value instanceof File && value.size > 0) {
        console.log('Uploading:', value.name, value.size, 'bytes')
        const blob = await put(
          `briefs/${Date.now()}-${value.name}`,
          value,
          { access: 'public' }
        )
        console.log('Uploaded to:', blob.url)
        uploads.push({ name: value.name, url: blob.url, field })
      }
    }

    return NextResponse.json({ success: true, uploads })

  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json(
      { error: 'Upload failed', detail: String(err) },
      { status: 500 }
    )
  }
}