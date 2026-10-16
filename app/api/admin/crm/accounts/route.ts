import { NextRequest, NextResponse } from 'next/server'
import { db, crmAccounts } from '@/lib/db'
import { desc } from 'drizzle-orm'

export async function GET() {
  const accounts = await db.select().from(crmAccounts).orderBy(desc(crmAccounts.updatedAt))
  return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
  const { name, tier, triggerText, triggerDate, notes } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const [account] = await db.insert(crmAccounts).values({
    name:        name.trim(),
    tier:        tier || 'B',
    triggerText: triggerText?.trim() || null,
    triggerDate: triggerDate || null,
    notes:       notes?.trim() || null,
  }).returning()

  return NextResponse.json(account)
}
