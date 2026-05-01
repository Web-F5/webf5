import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const uploads: { name: string; url: string; field: string }[] = []

    for (const [field, value] of form.entries()) {
      if (value instanceof File && value.size > 0) {
        const blob = await put(
          `briefs/${Date.now()}-${value.name}`,
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
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}