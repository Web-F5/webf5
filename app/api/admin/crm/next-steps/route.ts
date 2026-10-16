import { NextResponse } from 'next/server'
import { db, crmDeals, crmAccounts } from '@/lib/db'
import { eq, ne, and, or, isNotNull } from 'drizzle-orm'

export async function GET() {
  const rows = await db
    .select({
      dealId:       crmDeals.id,
      dealName:     crmDeals.name,
      dealStatus:   crmDeals.status,
      nextStep:     crmDeals.nextStep,
      nextStepDate: crmDeals.nextStepDate,
      accountId:    crmAccounts.id,
      accountName:  crmAccounts.name,
      accountTier:  crmAccounts.tier,
    })
    .from(crmDeals)
    .innerJoin(crmAccounts, eq(crmDeals.accountId, crmAccounts.id))
    .where(and(
      ne(crmDeals.status, 'lost'),
      ne(crmDeals.status, 'signed'),
      or(isNotNull(crmDeals.nextStep), isNotNull(crmDeals.nextStepDate)),
    ))

  return NextResponse.json(rows)
}
