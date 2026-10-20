import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, outreachTouches, outreachProspects } from '@/lib/db'
import { eq, gte, lte, asc, and } from 'drizzle-orm'

async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_SECRET
}

// GET — list touches, optionally filtered by date range
export async function GET(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const from = req.nextUrl.searchParams.get('from')
  const to   = req.nextUrl.searchParams.get('to')

  const conditions = []
  if (from) conditions.push(gte(outreachTouches.scheduledFor, new Date(from)))
  if (to)   conditions.push(lte(outreachTouches.scheduledFor, new Date(to)))

  const touches = await db
    .select({
      id:           outreachTouches.id,
      prospectId:   outreachTouches.prospectId,
      sendId:       outreachTouches.sendId,
      sequenceName: outreachTouches.sequenceName,
      touchName:    outreachTouches.touchName,
      touchNumber:  outreachTouches.touchNumber,
      channel:      outreachTouches.channel,
      scheduledFor: outreachTouches.scheduledFor,
      status:       outreachTouches.status,
      completedAt:  outreachTouches.completedAt,
      createdAt:    outreachTouches.createdAt,
      prospectName:    outreachProspects.name,
      prospectCompany: outreachProspects.company,
      prospectEmail:   outreachProspects.email,
    })
    .from(outreachTouches)
    .innerJoin(outreachProspects, eq(outreachTouches.prospectId, outreachProspects.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(outreachTouches.scheduledFor))

  return NextResponse.json({ touches })
}

// PATCH — mark a touch complete or skipped
export async function PATCH(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id, status } = await req.json()
  if (!id || !['completed', 'skipped', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'id and valid status required' }, { status: 400 })
  }

  const [updated] = await db.update(outreachTouches)
    .set({
      status,
      completedAt: status === 'completed' ? new Date() : null,
    })
    .where(eq(outreachTouches.id, id))
    .returning()

  return NextResponse.json({ touch: updated })
}
