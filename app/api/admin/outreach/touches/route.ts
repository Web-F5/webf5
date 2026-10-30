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

  const from       = req.nextUrl.searchParams.get('from')
  const to         = req.nextUrl.searchParams.get('to')
  const prospectId = req.nextUrl.searchParams.get('prospectId')

  const conditions = []
  if (from)       conditions.push(gte(outreachTouches.scheduledFor, new Date(from)))
  if (to)         conditions.push(lte(outreachTouches.scheduledFor, new Date(to)))
  if (prospectId) conditions.push(eq(outreachTouches.prospectId, prospectId))

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
      prospectNotes:   outreachProspects.notes,
    })
    .from(outreachTouches)
    .innerJoin(outreachProspects, eq(outreachTouches.prospectId, outreachProspects.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(outreachTouches.scheduledFor))

  return NextResponse.json({ touches })
}

// PATCH — update status and/or reschedule a touch
export async function PATCH(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { id, status, scheduledFor } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (status === undefined && scheduledFor === undefined) {
    return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
  }

  if (status !== undefined && !['completed', 'skipped', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 })
  }

  const setData: {
    status?: string
    completedAt?: Date | null
    scheduledFor?: Date
  } = {}
  if (status      !== undefined) { setData.status = status; setData.completedAt = status === 'completed' ? new Date() : null }
  if (scheduledFor !== undefined) { setData.scheduledFor = new Date(scheduledFor) }

  const [updated] = await db.update(outreachTouches)
    .set(setData)
    .where(eq(outreachTouches.id, id))
    .returning()

  return NextResponse.json({ touch: updated })
}

// DELETE — remove a touch entirely
export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await db.delete(outreachTouches).where(eq(outreachTouches.id, id))
  return NextResponse.json({ ok: true })
}
