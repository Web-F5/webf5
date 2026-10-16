import { NextRequest, NextResponse } from 'next/server'
import { db, crmTaskProgress } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const scopeType = req.nextUrl.searchParams.get('scopeType') ?? 'workspace'
  const scopeId   = req.nextUrl.searchParams.get('scopeId')   ?? 'workspace'
  const rows = await db.select().from(crmTaskProgress)
    .where(and(
      eq(crmTaskProgress.scopeType, scopeType),
      eq(crmTaskProgress.scopeId,   scopeId),
    ))
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { scopeType, scopeId, taskId, checked, answer } = await req.json()
  if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })

  const scope = scopeType ?? 'workspace'
  const sid   = scopeId   ?? 'workspace'

  // Upsert: update if exists, insert if not
  const existing = await db.select().from(crmTaskProgress)
    .where(and(
      eq(crmTaskProgress.scopeType, scope),
      eq(crmTaskProgress.scopeId,   sid),
      eq(crmTaskProgress.taskId,    taskId),
    ))

  if (existing.length > 0) {
    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (checked !== undefined) updates.checked = checked
    if (answer  !== undefined) updates.answer  = answer ?? null
    const [row] = await db.update(crmTaskProgress)
      .set(updates)
      .where(eq(crmTaskProgress.id, existing[0].id))
      .returning()
    return NextResponse.json(row)
  } else {
    const [row] = await db.insert(crmTaskProgress).values({
      scopeType: scope,
      scopeId:   sid,
      taskId,
      checked:   checked ?? false,
      answer:    answer ?? null,
    }).returning()
    return NextResponse.json(row)
  }
}
