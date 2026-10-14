import { NextRequest, NextResponse } from 'next/server'
import { db, reviewRatings } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { token, rating, feedback } = await req.json()

    if (!token) return NextResponse.json({ error: 'Invalid token.' }, { status: 400 })

    const [record] = await db
      .select()
      .from(reviewRatings)
      .where(eq(reviewRatings.id, token))
      .limit(1)

    if (!record) return NextResponse.json({ error: 'Review link not found.' }, { status: 404 })

    // Allow updating feedback on an already-rated record (low-score feedback step)
    const updateData: Partial<typeof reviewRatings.$inferInsert> = {}
    if (rating != null) updateData.rating = rating
    if (feedback != null) updateData.feedback = feedback
    if (!record.ratedAt) updateData.ratedAt = new Date()

    await db
      .update(reviewRatings)
      .set(updateData)
      .where(eq(reviewRatings.id, token))

    return NextResponse.json({
      success:      true,
      positive:     (rating ?? record.rating ?? 0) >= 7,
      reviewUrl:    record.reviewUrl,
      platform:     record.platform,
      fromBusiness: record.fromBusiness,
    })
  } catch (err) {
    console.error('Rate error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
