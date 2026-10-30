import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const NOTIFY_TO = process.env.NOTIFY_EMAIL!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { step, source, data } = body as {
      step: number
      source: 'brief' | 'diy'
      data: Record<string, unknown>
    }

    const bizName    = (data.bizName    as string | undefined)?.trim() || 'Unknown'
    const bizEmail   = (data.bizEmail   as string | undefined)?.trim() || '—'
    const bizPhone   = (data.bizPhone   as string | undefined)?.trim() || '—'
    const contactName = (data.contactName as string | undefined)?.trim() || '—'
    const services   = Array.isArray(data.services) ? (data.services as string[]).join(', ') : '—'
    const pages      = Array.isArray(data.pages)    ? (data.pages    as string[]).join(', ') : '—'

    const label  = source === 'diy' ? 'DIY' : 'Done For You'
    const subject = `Partial brief (step ${step}) — ${bizName} [${label}]`

    const lines = [
      `Brief in progress — step ${step} of ${source === 'diy' ? 8 : 11} (${label})`,
      '',
      '── Contact ──────────────────────────',
      `Name:     ${contactName}`,
      `Business: ${bizName}`,
      `Email:    ${bizEmail}`,
      `Phone:    ${bizPhone}`,
      '',
      '── Project so far ───────────────────',
      `Start type:    ${data.startType    || '—'}`,
      `Domain:        ${data.domainStatus === 'have' ? data.domainName || 'existing' : data.domainStatus || '—'}`,
      `Tagline:       ${data.bizTagline   || '—'}`,
      `Description:   ${data.bizDesc      || '—'}`,
      `Service reach: ${data.serviceReach || '—'}`,
      `Service area:  ${data.serviceRadiusTowns || data.localArea || '—'}`,
      `Services:      ${services}`,
      `Pages:         ${pages}`,
      `Design style:  ${data.designStyle  || '—'}`,
    ]

    if (source === 'brief') {
      lines.push(
        `Brand primary: ${data.brandPrimary  || '—'}`,
        `Display font:  ${data.displayFont   || '—'}`,
        `Body font:     ${data.bodyFont       || '—'}`,
        `Budget:        ${data.budget         || '—'}`,
        `Timeline:      ${data.timeline       || '—'}`,
      )
    }

    lines.push('', `View in admin: https://www.webf5.com.au/admin/briefs`)

    await resend.emails.send({
      from: 'contact@webf5.au',
      to: NOTIFY_TO,
      subject,
      text: lines.join('\n'),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[partial-progress]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
