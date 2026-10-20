import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, outreachTouches, outreachProspects } from '@/lib/db'
import { eq, asc } from 'drizzle-orm'

async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_SECRET
}

function toIcsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export async function GET() {
  if (!await isAdmin()) return new NextResponse('Unauthorised', { status: 401 })

  const touches = await db
    .select({
      id:           outreachTouches.id,
      sequenceName: outreachTouches.sequenceName,
      touchName:    outreachTouches.touchName,
      channel:      outreachTouches.channel,
      scheduledFor: outreachTouches.scheduledFor,
      status:       outreachTouches.status,
      prospectName:    outreachProspects.name,
      prospectCompany: outreachProspects.company,
      prospectEmail:   outreachProspects.email,
    })
    .from(outreachTouches)
    .innerJoin(outreachProspects, eq(outreachTouches.prospectId, outreachProspects.id))
    .where(eq(outreachTouches.status, 'pending'))
    .orderBy(asc(outreachTouches.scheduledFor))

  const channelLabel: Record<string, string> = {
    email: '📧 Email', phone: '📞 Call', linkedin: '💼 LinkedIn', video: '🎥 Video', note: '📝 Note',
  }

  const events = touches.map(t => {
    const start = new Date(t.scheduledFor)
    start.setHours(9, 0, 0, 0)
    const end = new Date(start.getTime() + 30 * 60000)
    const uid = `webf5-touch-${t.id}@webf5.com.au`
    const summary = icsEscape(`${channelLabel[t.channel] ?? t.channel}: ${t.touchName} — ${t.prospectCompany}`)
    const description = icsEscape(
      `Sequence: ${t.sequenceName}\nTouch: ${t.touchName}\nContact: ${t.prospectName} (${t.prospectEmail})\nChannel: ${t.channel}`
    )
    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${toIcsDate(start)}`,
      `DTEND:${toIcsDate(end)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'END:VEVENT',
    ].join('\r\n')
  })

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Web F5//Outreach Touches//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="webf5-outreach-touches.ics"',
    },
  })
}
