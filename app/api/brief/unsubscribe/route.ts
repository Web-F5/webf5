import { NextRequest, NextResponse } from 'next/server'
import { db, briefDrafts } from '@/lib/db'
import { eq, or } from 'drizzle-orm'

// GET /api/brief/unsubscribe?token=xxx
// Linked from reminder emails — sets consent_followup_email = false
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return new NextResponse('Missing token', { status: 400 })
  }

  // Find the draft by token to get the guest email
  const draft = await db.query.briefDrafts.findFirst({
    where: eq(briefDrafts.guestToken, token),
  })

  if (!draft) {
    return new NextResponse('Brief not found', { status: 404 })
  }

  // Unsubscribe this draft (and any others with the same email)
  if (draft.guestEmail) {
    await db.update(briefDrafts)
      .set({ consentFollowupEmail: false })
      .where(eq(briefDrafts.guestEmail, draft.guestEmail))
  } else {
    await db.update(briefDrafts)
      .set({ consentFollowupEmail: false })
      .where(eq(briefDrafts.guestToken, token))
  }

  return new NextResponse(
    `<!doctype html><html><body style="font-family:sans-serif;padding:2rem;background:#0A0F1E;color:#fff">
      <h2>You've been unsubscribed</h2>
      <p>You won't receive any more reminder emails about your Web F5 brief.</p>
      <p><a href="https://www.webf5.com.au" style="color:#6366f1">Return to webf5.com.au</a></p>
    </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  )
}
