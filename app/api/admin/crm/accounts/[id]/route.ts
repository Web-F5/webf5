import { NextRequest, NextResponse } from 'next/server'
import { db, crmAccounts } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.name         !== undefined) updates.name         = body.name.trim()
  if (body.tier         !== undefined) updates.tier         = body.tier
  if (body.triggerText  !== undefined) updates.triggerText  = body.triggerText?.trim() || null
  if (body.triggerDate  !== undefined) updates.triggerDate  = body.triggerDate || null
  if (body.currentStage !== undefined) updates.currentStage = body.currentStage
  if (body.notes        !== undefined) updates.notes        = body.notes?.trim() || null

  const [account] = await db.update(crmAccounts).set(updates).where(eq(crmAccounts.id, id)).returning()
  return NextResponse.json(account)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.delete(crmAccounts).where(eq(crmAccounts.id, id))
  return NextResponse.json({ ok: true })
}
