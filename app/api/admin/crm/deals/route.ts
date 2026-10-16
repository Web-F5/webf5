import { NextRequest, NextResponse } from 'next/server'
import { db, crmDeals } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get('accountId')
  if (!accountId) return NextResponse.json([])
  const deals = await db.select().from(crmDeals).where(eq(crmDeals.accountId, accountId))
  return NextResponse.json(deals)
}

export async function POST(req: NextRequest) {
  const { accountId, name, stage, notes } = await req.json()
  if (!accountId || !name?.trim()) {
    return NextResponse.json({ error: 'accountId and name required' }, { status: 400 })
  }
  const [deal] = await db.insert(crmDeals).values({
    accountId,
    name:  name.trim(),
    stage: stage ?? 2,
    notes: notes?.trim() || null,
  }).returning()
  return NextResponse.json(deal)
}
