import { NextResponse } from 'next/server'
import { db, reviewRatings } from '@/lib/db'
import { desc, isNotNull } from 'drizzle-orm'

export async function GET() {
  try {
    const responses = await db
      .select()
      .from(reviewRatings)
      .where(isNotNull(reviewRatings.ratedAt))
      .orderBy(desc(reviewRatings.ratedAt))
      .limit(200)

    // Also fetch pending (sent but not yet rated)
    const pending = await db
      .select({ count: reviewRatings.id })
      .from(reviewRatings)

    return NextResponse.json({ responses, total: pending.length })
  } catch (err) {
    console.error('Responses fetch error:', err)
    return NextResponse.json({ error: 'Failed to load responses.' }, { status: 500 })
  }
}
