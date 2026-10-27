// Fires when the DIY wizard reaches Step 7 → Step 8.
// Saves the brief to briefDrafts (appears in /admin/briefs) and emails briefs@webf5.au.

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db, briefDrafts } from '@/lib/db'
import type { WizardData } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

function serializeData(data: Record<string, unknown>): Record<string, unknown> {
  const skip = new Set(['logoFiles', 'heroLandscapeFiles', 'heroPortraitFiles', 'aboutImageFile', 'existingCopyFiles', 'photoFiles'])
  return Object.fromEntries(Object.entries(data).filter(([k]) => !skip.has(k)))
}

export async function POST(req: NextRequest) {
  try {
    const data: WizardData = await req.json()

    const serialized = serializeData({ ...data as unknown as Record<string, unknown>, source: 'diy' })
    const guestEmail = data.bizEmail?.trim() || null
    const now = new Date()

    // Upsert into briefDrafts — keyed by email so repeated Step 7 → 8 → back navigations
    // don't create duplicate rows. We use a fresh guestToken per session.
    const guestToken = `diy-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    await db.insert(briefDrafts).values({
      guestToken,
      guestEmail,
      currentStep: 8,
      data: serialized,
      status: 'in_progress',
      consentFollowupEmail: false,
      expiresAt,
    })

    // Email briefs@webf5.au with a plain-text summary
    const timestamp = now.toLocaleString('en-AU', { timeZone: 'Australia/Melbourne', dateStyle: 'medium', timeStyle: 'short' })
    const emailText = [
      `New DIY brief — ${data.bizName?.trim() || 'Unknown'}`,
      `Captured: ${timestamp}`,
      '',
      '── Contact ──────────────────────────',
      `Name:    ${data.contactName?.trim() || '—'}`,
      `Email:   ${guestEmail || '—'}`,
      `Phone:   ${data.bizPhone?.trim() || '—'}`,
      `Business: ${data.bizName?.trim() || '—'}`,
      `ABN:     ${data.bizReg?.trim() || '—'}`,
      '',
      '── Project ───────────────────────────',
      `Start type:   ${data.startType || '—'}`,
      `Domain:       ${data.domainStatus === 'have' ? data.domainName || 'existing' : data.domainStatus || '—'}`,
      `Service reach: ${data.serviceReach || '—'}`,
      `Service area:  ${data.serviceRadiusTowns || data.localArea || '—'}`,
      '',
      '── Design ────────────────────────────',
      `Style:         ${data.designStyle || '—'}`,
      `Primary:       ${data.brandPrimary || '—'}`,
      `Display font:  ${data.displayFont || '—'}`,
      `Body font:     ${data.bodyFont || '—'}`,
      '',
      '── Pages ─────────────────────────────',
      (data.pages || []).join(', ') || '—',
      '',
      '── Next step ─────────────────────────',
      'They will complete Step 8 and email themselves a copy of the brief + Claude prompt.',
      `View in admin: https://www.webf5.com.au/admin/briefs`,
    ].join('\n')

    await resend.emails.send({
      from: 'contact@webf5.au',
      to: process.env.NOTIFY_EMAIL!,
      subject: `New DIY brief — ${data.bizName?.trim() || 'Unknown'}`,
      text: emailText,
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[diy-brief/save]', err)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}
