import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const uploads: { name: string; url: string; field: string }[] = []

    const folder = form.get('folder')?.toString() || 'unknown-business'

    for (const [field, value] of form.entries()) {
      if (field === 'folder') continue
      if (value instanceof File && value.size > 0) {
        const blob = await put(
          `briefs/${folder}/${Date.now()}-${value.name}`,
          value,
          { access: 'public' }
        )
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