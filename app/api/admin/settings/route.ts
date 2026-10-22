import { NextResponse } from 'next/server'
import { db, appSettings } from '@/lib/db'

const ALLOWED_KEYS = ['sender_name', 'sender_title', 'sender_company', 'sender_slogan', 'sender_phone', 'sender_website'] as const

export async function GET() {
  const rows = await db.select().from(appSettings)
  const result: Record<string, string> = {}
  for (const row of rows) result[row.key] = row.value
  return NextResponse.json(result)
}

export async function PUT(req: Request) {
  const body = await req.json() as Record<string, string>

  for (const key of ALLOWED_KEYS) {
    if (key in body) {
      await db
        .insert(appSettings)
        .values({ key, value: body[key] ?? '', updatedAt: new Date() })
        .onConflictDoUpdate({ target: appSettings.key, set: { value: body[key] ?? '', updatedAt: new Date() } })
    }
  }

  return NextResponse.json({ ok: true })
}
