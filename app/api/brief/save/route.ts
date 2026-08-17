import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, briefDrafts } from '@/lib/db'
import { eq, and, isNull } from 'drizzle-orm'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Guest data expires after 30 days; signed-in rows are permanent
const GUEST_TTL_DAYS = 30

// Rate-limit inactivity emails to once per hour
const INACTIVITY_EMAIL_COOLDOWN_MS = 60 * 60 * 1000

interface SaveBody {
  guestToken?: string
  currentStep: number
  data: Record<string, unknown>
  consentFollowup: boolean
  sendInactivityEmail?: boolean // client fires this after 5 min idle
}

// Strip File objects — they can't be serialised into JSON/JSONB
function serializeData(data: Record<string, unknown>): Record<string, unknown> {
  const skip = new Set([
    'logoFiles', 'heroLandscapeFiles', 'heroPortraitFiles',
    'aboutImageFile', 'existingCopyFiles', 'photoFiles',
  ])
  return Object.fromEntries(
    Object.entries(data).filter(([k]) => !skip.has(k))
  )
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    const body: SaveBody = await req.json()
    const { guestToken, currentStep, data, consentFollowup, sendInactivityEmail } = body

    if (!userId && !guestToken) {
      return NextResponse.json({ error: 'guest_token required for unauthenticated saves' }, { status: 400 })
    }

    const serialized = serializeData(data)
    const now = new Date()
    const guestEmail = (data.bizEmail as string | undefined)?.trim() || null
    const consentAt = consentFollowup ? now : null

    // ── Upsert the draft row ──────────────────────────────────────────────────
    let draftId: string | null = null

    if (userId) {
      // Signed-in: look up by userId, most recent in-progress draft
      const existing = await db.query.briefDrafts.findFirst({
        where: and(eq(briefDrafts.userId, userId), eq(briefDrafts.status, 'in_progress')),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      })

      if (existing) {
        await db.update(briefDrafts).set({
          currentStep,
          data: serialized,
          consentFollowupEmail: consentFollowup,
          consentCapturedAt: consentAt ?? existing.consentCapturedAt,
          updatedAt: now,
          lastActivityAt: now,
        }).where(eq(briefDrafts.id, existing.id))
        draftId = existing.id
      } else {
        const [created] = await db.insert(briefDrafts).values({
          userId,
          currentStep,
          data: serialized,
          consentFollowupEmail: consentFollowup,
          consentCapturedAt: consentAt,
        }).returning({ id: briefDrafts.id })
        draftId = created.id
      }
    } else {
      // Guest: look up by guestToken
      const existing = await db.query.briefDrafts.findFirst({
        where: eq(briefDrafts.guestToken, guestToken!),
      })

      const expiresAt = new Date(now.getTime() + GUEST_TTL_DAYS * 24 * 60 * 60 * 1000)

      if (existing) {
        await db.update(briefDrafts).set({
          currentStep,
          data: serialized,
          guestEmail: guestEmail ?? existing.guestEmail,
          consentFollowupEmail: consentFollowup,
          consentCapturedAt: consentAt ?? existing.consentCapturedAt,
          updatedAt: now,
          lastActivityAt: now,
          expiresAt,
        }).where(eq(briefDrafts.id, existing.id))
        draftId = existing.id

        // Send resume link once — after step 3 when we have an email
        if (
          !existing.resumeEmailSent &&
          currentStep >= 3 &&
          guestEmail
        ) {
          await sendResumeEmail(guestEmail, guestToken!, data)
          await db.update(briefDrafts).set({ resumeEmailSent: true }).where(eq(briefDrafts.id, existing.id))
        }

        // 5-minute inactivity email — rate-limited to 1/hr
        if (sendInactivityEmail && guestEmail && consentFollowup) {
          const lastSent = existing.lastInactivityEmailAt
          const cooldownPassed = !lastSent || now.getTime() - lastSent.getTime() > INACTIVITY_EMAIL_COOLDOWN_MS
          if (cooldownPassed) {
            await sendInactivityReminderEmail(guestEmail, guestToken!, currentStep)
            await db.update(briefDrafts).set({ lastInactivityEmailAt: now }).where(eq(briefDrafts.id, existing.id))
          }
        }
      } else {
        const [created] = await db.insert(briefDrafts).values({
          guestToken: guestToken!,
          guestEmail,
          currentStep,
          data: serialized,
          consentFollowupEmail: consentFollowup,
          consentCapturedAt: consentAt,
          expiresAt,
        }).returning({ id: briefDrafts.id })
        draftId = created.id
      }
    }

    return NextResponse.json({ ok: true, draftId })
  } catch (err) {
    console.error('Brief save error:', err)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}

// ── GET: retrieve a draft by guest token (for resume page) ────────────────────
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const draft = await db.query.briefDrafts.findFirst({
    where: eq(briefDrafts.guestToken, token),
  })

  if (!draft) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Check expiry
  if (draft.expiresAt && draft.expiresAt < new Date()) {
    return NextResponse.json({ error: 'expired' }, { status: 410 })
  }

  return NextResponse.json({ draft })
}

// ── Email helpers ─────────────────────────────────────────────────────────────

async function sendResumeEmail(email: string, token: string, data: Record<string, unknown>) {
  const name = (data.contactName as string) || (data.bizName as string) || 'there'
  const resumeUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.webf5.com.au'}/brief/resume/${token}`

  // Notify you (same as partial capture)
  await resend.emails.send({
    from: 'contact@webf5.au',
    to: process.env.LEADS_EMAIL ?? process.env.NOTIFY_EMAIL!,
    subject: `New lead — ${data.bizName ?? 'Unknown'} (brief in progress)`,
    text: [
      `New lead captured at step 3.`,
      `Name:  ${data.contactName ?? '—'}`,
      `Biz:   ${data.bizName ?? '—'}`,
      `Email: ${email}`,
      `Phone: ${data.bizPhone ?? '—'}`,
      ``,
      `Resume link: ${resumeUrl}`,
    ].join('\n'),
  }).catch(() => {})

  // Send resume link to guest
  await resend.emails.send({
    from: 'contact@webf5.au',
    to: email,
    replyTo: 'contact@webf5.au',
    subject: `Your Web F5 brief is saved — pick up where you left off`,
    text: [
      `Hi ${name},`,
      ``,
      `You're partway through your Web F5 discovery brief. Here's your personal resume link — click it anytime to pick up exactly where you left off:`,
      ``,
      `${resumeUrl}`,
      ``,
      `Your progress is saved for 30 days. Create a free account at webf5.com.au and we'll keep it for 12 months — and autofill your details next time.`,
      ``,
      `Questions? Reply to this email or reach us at contact@webf5.au`,
      ``,
      `Talk soon,`,
      `Josh`,
      `Web F5`,
    ].join('\n'),
  }).catch(() => {})
}

async function sendInactivityReminderEmail(email: string, token: string, currentStep: number) {
  const resumeUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.webf5.com.au'}/brief/resume/${token}`
  await resend.emails.send({
    from: 'contact@webf5.au',
    to: email,
    replyTo: 'contact@webf5.au',
    subject: `Still working on your brief? We saved your progress.`,
    text: [
      `Hi,`,
      ``,
      `It looks like you stepped away from your Web F5 brief (you were up to step ${currentStep} of 11). No problem — we've saved everything.`,
      ``,
      `Pick up where you left off:`,
      `${resumeUrl}`,
      ``,
      `Takes about 20 minutes total. The more detail you give us, the better we can tailor your quote.`,
      ``,
      `Talk soon,`,
      `Josh`,
      `Web F5`,
      ``,
      `—`,
      `Don't want reminders? Unsubscribe: ${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.webf5.com.au'}/api/brief/unsubscribe?token=${token}`,
    ].join('\n'),
  }).catch(() => {})
}
