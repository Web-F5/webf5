import { NextRequest, NextResponse } from 'next/server'
import { db, crmDeals } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  const fields = ['name','stage','status','nextStep','nextStepDate','problemText','problemValue',
                  'compellingEvent','compellingDate','notes'] as const
  for (const f of fields) {
    if (body[f] !== undefined) updates[f] = body[f] ?? null
  }
  if (body.signedAt !== undefined) updates.signedAt = body.signedAt ? new Date(body.signedAt) : null

  const [deal] = await db.update(crmDeals).set(updates).where(eq(crmDeals.id, id)).returning()
  return NextResponse.json(deal)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.delete(crmDeals).where(eq(crmDeals.id, id))
  return NextResponse.json({ ok: true })
}
