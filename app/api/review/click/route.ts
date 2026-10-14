import { NextRequest, NextResponse } from 'next/server'
import { db, reviewRatings } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ ok: true })
    await db.update(reviewRatings).set({ clickedReview: true }).where(eq(reviewRatings.id, token))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // non-critical — don't error
  }
}
