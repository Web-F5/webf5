import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, outreachProspects, outreachSends, outreachTouches, crmAccounts } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { FULL_SEQUENCES } from '@/lib/outreach-sequences-full'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_SECRET
}

function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from)
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) added++
  }
  return d
}

function parseAccountNotes(notes: string | null) {
  const get = (key: string) => notes?.match(new RegExp(`^${key}:\\s*(.+)`, 'im'))?.[1]?.trim() ?? ''
  return {
    email:              get('Email'),
    ownerName:          get('Owner'),
    website:            get('Website'),
    sequenceName:       get('SequenceName'),
    sequenceProspectId: get('SequenceProspectId'),
  }
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { accountId, subject, body, bodyHtml, sendEmail } = await req.json() as {
    accountId: string
    subject: string
    body: string
    bodyHtml?: string
    sendEmail?: boolean
  }

  if (!accountId || !subject || !body) {
    return NextResponse.json({ error: 'accountId, subject and body are required' }, { status: 400 })
  }

  const [account] = await db.select().from(crmAccounts).where(eq(crmAccounts.id, accountId))
  if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

  const np = parseAccountNotes(account.notes)
  if (!np.sequenceName) return NextResponse.json({ error: 'No sequence selected on this account' }, { status: 400 })

  const sequence = FULL_SEQUENCES.find(s => s.name === np.sequenceName)
  if (!sequence) return NextResponse.json({ error: `Sequence "${np.sequenceName}" not found` }, { status: 400 })

  // Create or reuse outreach prospect
  let prospectId = np.sequenceProspectId || ''
  if (!prospectId) {
    const [prospect] = await db.insert(outreachProspects).values({
      name:    np.ownerName || account.name,
      company: account.name,
      email:   np.email || 'unknown@unknown.com',
      website: np.website || undefined,
      notes:   `CrmAccountId: ${accountId}`,
    }).returning({ id: outreachProspects.id })
    prospectId = prospect.id

    // Append SequenceProspectId to account notes (preserving existing content)
    const updatedNotes = (account.notes || '') + `\nSequenceProspectId: ${prospectId}`
    await db.update(crmAccounts)
      .set({ notes: updatedNotes, updatedAt: new Date() })
      .where(eq(crmAccounts.id, accountId))
  }

  // Create send record for touch 1
  const touch1 = sequence.touches[0]
  const [send] = await db.insert(outreachSends).values({
    prospectId,
    subject,
    body,
    bodyHtml: bodyHtml || body,
    sequenceName: sequence.name,
    touchType:    touch1.name,
    status:       'sent',
  }).returning({ id: outreachSends.id })

  // Create touch 1 as completed (sent now)
  const today = new Date()
  await db.insert(outreachTouches).values({
    prospectId,
    sendId:       send.id,
    sequenceName: sequence.name,
    touchName:    touch1.name,
    touchNumber:  1,
    channel:      touch1.channel,
    scheduledFor: today,
    status:       'completed',
    completedAt:  today,
  })

  // Schedule remaining touches (touches 2..N)
  for (let i = 1; i < sequence.touches.length; i++) {
    const t = sequence.touches[i]
    // touch.day is 1-indexed from start; offset = day - 1 business days from today
    const scheduledFor = addBusinessDays(today, t.day - 1)
    await db.insert(outreachTouches).values({
      prospectId,
      sequenceName: sequence.name,
      touchName:    t.name,
      touchNumber:  i + 1,
      channel:      t.channel,
      scheduledFor,
      status:       'pending',
    })
  }

  // Optionally send the email
  if (sendEmail && np.email && np.email !== 'unknown@unknown.com') {
    await resend.emails.send({
      from:    'josh@webf5.au',
      to:      np.email,
      subject,
      html:    bodyHtml || `<p style="font-family:sans-serif;white-space:pre-wrap">${body}</p>`,
    }).catch(err => console.error('[start-sequence] email send failed:', err))
  }

  return NextResponse.json({ ok: true, prospectId, sendId: send.id })
}
