import { NextRequest, NextResponse } from 'next/server'
import { buildReviewEmailHtml } from '@/lib/review-email'

export async function POST(req: NextRequest) {
  const { fromBusiness, platform, reviewUrl, customMessage, recipientName, useFilter, logoBase64 } = await req.json()

  const html = buildReviewEmailHtml({
    recipientName: recipientName || 'Customer',
    fromBusiness:  fromBusiness || 'Your Business',
    platform:      platform || 'google',
    reviewUrl:     reviewUrl || '#',
    customMessage: customMessage?.trim() || undefined,
    ratingUrl:     useFilter ? 'https://webf5.com.au/review?t=preview' : undefined,
    logoBase64:    logoBase64 || undefined,
  })

  return NextResponse.json({ html })
}
