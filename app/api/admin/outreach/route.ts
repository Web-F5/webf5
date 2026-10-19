import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { cookies } from 'next/headers'
import { db, outreachProspects, outreachSends } from '@/lib/db'
import { desc, eq } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'contact@webf5.au'

async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_SECRET
}

function buildOutreachHtml(body: string, subject: string, prospectName: string): string {
  const bodyHtml = body
    .split('\n')
    .map(line => line.trim() === ''
      ? '<tr><td style="height:12px;"></td></tr>'
      : `<tr><td style="font-size:15px;line-height:1.65;color:#1F2937;font-family:Arial,Helvetica,sans-serif;">${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td></tr>`
    )
    .join('\n')

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <tr><td style="background:#0A0F1E;border-radius:10px 10px 0 0;padding:22px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="vertical-align:middle;">
        <a href="https://webf5.com.au" style="font-size:20px;font-weight:700;color:#6366F1;letter-spacing:-0.5px;font-family:Arial,Helvetica,sans-serif;text-decoration:none;">Web F5</a>
        <span style="font-size:10px;color:#F5A623;text-transform:uppercase;letter-spacing:1.5px;margin-left:10px;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;">Professional Web Development Services</span>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#6366F1;height:2px;"></td></tr>
  <tr><td style="padding:32px 32px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${bodyHtml}
    </table>
  </td></tr>
  <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>
  <tr><td style="padding:20px 32px 24px;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-right:16px;border-right:3px solid #6366F1;vertical-align:top;white-space:nowrap;">
          <a href="https://webf5.com.au" style="font-size:19px;font-weight:700;color:#6366F1;letter-spacing:-0.5px;line-height:1.2;font-family:Arial,Helvetica,sans-serif;text-decoration:none;display:block;">Web F5</a>
          <div style="font-size:9px;color:#F5A623;text-transform:uppercase;letter-spacing:1.2px;margin-top:5px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Professional<br>Web Development<br>Services</div>
        </td>
        <td style="padding-left:16px;vertical-align:top;">
          <div style="font-size:14px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">Josh Ekberg</div>
          <div style="font-size:12px;color:#6366F1;margin-bottom:6px;font-family:Arial,Helvetica,sans-serif;">Account Executive</div>
          <div style="font-size:12px;color:#4B5563;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">
            <a href="tel:0419510206" style="color:#4B5563;text-decoration:none;">0419 510 206</a><br>
            <a href="mailto:contact@webf5.au" style="color:#6366F1;text-decoration:none;">contact@webf5.au</a><br>
            <a href="https://webf5.com.au" style="color:#6366F1;text-decoration:none;">webf5.com.au</a>
          </div>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="background:#f9fafb;border-radius:0 0 10px 10px;padding:14px 32px;border-top:1px solid #e5e7eb;">
    <p style="font-size:11px;color:#9CA3AF;margin:0;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Web F5 · Belmont VIC 3216 · ABN 23 626 640 650<br>
    You're receiving this because we think we could help your business. <a href="#" style="color:#9CA3AF;">Unsubscribe</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

// ── GET — list prospects + their send history ──────────────────────────────

export async function GET() {
  const [prospects, sends] = await Promise.all([
    db.select().from(outreachProspects).orderBy(desc(outreachProspects.createdAt)),
    db.select().from(outreachSends).orderBy(desc(outreachSends.createdAt)),
  ])

  // Group sends by prospectId
  const sendsByProspect: Record<string, typeof sends> = {}
  for (const s of sends) {
    if (!sendsByProspect[s.prospectId]) sendsByProspect[s.prospectId] = []
    sendsByProspect[s.prospectId].push(s)
  }

  return NextResponse.json({ prospects, sendsByProspect })
}

// ── POST — create prospect OR send email ───────────────────────────────────

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()

  // Create / update prospect
  if (body.action === 'save_prospect') {
    const { id, name, title, company, website, email, linkedin, notes } = body
    if (!name?.trim() || !company?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name, company and email are required.' }, { status: 400 })
    }
    if (id) {
      const [row] = await db.update(outreachProspects)
        .set({ name, title, company, website, email, linkedin, notes, updatedAt: new Date() })
        .where(eq(outreachProspects.id, id))
        .returning()
      return NextResponse.json(row)
    } else {
      const [row] = await db.insert(outreachProspects)
        .values({ name, title, company, website, email, linkedin, notes })
        .returning()
      return NextResponse.json(row)
    }
  }

  // Send outreach email
  if (body.action === 'send') {
    const { prospectId, subject, emailBody, sequenceName, touchType } = body
    if (!prospectId || !subject?.trim() || !emailBody?.trim()) {
      return NextResponse.json({ error: 'Prospect, subject and body are required.' }, { status: 400 })
    }

    const [prospect] = await db.select().from(outreachProspects).where(eq(outreachProspects.id, prospectId))
    if (!prospect) return NextResponse.json({ error: 'Prospect not found.' }, { status: 404 })

    const bodyHtml = buildOutreachHtml(emailBody, subject, prospect.name)

    const result = await resend.emails.send({
      from:    `Josh Ekberg at Web F5 <${FROM}>`,
      to:      prospect.email,
      replyTo: FROM,
      subject,
      html:    bodyHtml,
    })

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })

    const [send] = await db.insert(outreachSends).values({
      prospectId,
      subject,
      body:     emailBody,
      bodyHtml,
      sequenceName: sequenceName || null,
      touchType:    touchType    || null,
    }).returning()

    return NextResponse.json({ success: true, send })
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
}

// ── DELETE — remove a prospect ─────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { id } = await req.json()
  await db.delete(outreachProspects).where(eq(outreachProspects.id, id))
  return NextResponse.json({ success: true })
}
