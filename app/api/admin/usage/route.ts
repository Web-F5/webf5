import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, reviewSends, reviewSenderLeads, outreachSends, outreachProspects, auditLeads, checklistLeads } from '@/lib/db'
import { count, sum, gte, sql } from 'drizzle-orm'

async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_SECRET
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [
    reviewSendTotal,
    reviewSendMonth,
    reviewEmailsTotal,
    reviewEmailsMonth,
    outreachSendTotal,
    outreachSendMonth,
    prospectsTotal,
    prospectsMonth,
    prospectsResearched,
    auditTotal,
    auditMonth,
    checklistTotal,
    checklistMonth,
    reviewLeadsTotal,
    reviewLeadsMonth,
  ] = await Promise.all([
    db.select({ c: count() }).from(reviewSends),
    db.select({ c: count() }).from(reviewSends).where(gte(reviewSends.createdAt, monthStart)),
    db.select({ s: sum(reviewSends.recipientCount) }).from(reviewSends),
    db.select({ s: sum(reviewSends.recipientCount) }).from(reviewSends).where(gte(reviewSends.createdAt, monthStart)),
    db.select({ c: count() }).from(outreachSends),
    db.select({ c: count() }).from(outreachSends).where(gte(outreachSends.createdAt, monthStart)),
    db.select({ c: count() }).from(outreachProspects),
    db.select({ c: count() }).from(outreachProspects).where(gte(outreachProspects.createdAt, monthStart)),
    db.select({ c: count() }).from(outreachProspects).where(
      sql`${outreachProspects.researchData} != '{}'::jsonb`
    ),
    db.select({ c: count() }).from(auditLeads),
    db.select({ c: count() }).from(auditLeads).where(gte(auditLeads.createdAt, monthStart)),
    db.select({ c: count() }).from(checklistLeads),
    db.select({ c: count() }).from(checklistLeads).where(gte(checklistLeads.createdAt, monthStart)),
    db.select({ c: count() }).from(reviewSenderLeads),
    db.select({ c: count() }).from(reviewSenderLeads).where(gte(reviewSenderLeads.createdAt, monthStart)),
  ])

  // Cost estimates (Places API pricing as of 2025)
  // Each prospect = ~1 Text Search ($0.032) + 1 Place Details ($0.017) = $0.049
  // Each PageSpeed run = free (up to 25k/day)
  const totalProspects     = prospectsTotal[0].c
  const researched         = prospectsResearched[0].c
  const estimatedPlacesCost = totalProspects * 0.049

  return NextResponse.json({
    reviewSends: {
      total: reviewSendTotal[0].c,
      thisMonth: reviewSendMonth[0].c,
      emailsTotal: Number(reviewEmailsTotal[0].s ?? 0),
      emailsThisMonth: Number(reviewEmailsMonth[0].s ?? 0),
    },
    outreachSends: {
      total: outreachSendTotal[0].c,
      thisMonth: outreachSendMonth[0].c,
    },
    prospects: {
      total: totalProspects,
      thisMonth: prospectsMonth[0].c,
      researched,
    },
    auditLeads: {
      total: auditTotal[0].c,
      thisMonth: auditMonth[0].c,
    },
    checklistLeads: {
      total: checklistTotal[0].c,
      thisMonth: checklistMonth[0].c,
    },
    reviewLeads: {
      total: reviewLeadsTotal[0].c,
      thisMonth: reviewLeadsMonth[0].c,
    },
    costs: {
      estimatedPlacesCost,
      // PageSpeed: free tier up to 25k/day, assumed $0
      pagespeedCost: 0,
    },
    generatedAt: new Date().toISOString(),
  })
}
