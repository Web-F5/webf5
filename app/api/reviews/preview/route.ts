import { NextRequest, NextResponse } from 'next/server'
import { buildReviewEmailHtml } from '@/lib/review-email'

export async function POST(req: NextRequest) {
  const { fromBusiness, fromEmail, platform, reviewUrl, customMessage, recipientName, logoBase64 } = await req.json()

  let html = buildReviewEmailHtml({
    recipientName: recipientName || 'Customer',
    fromBusiness:  fromBusiness || 'Your Business',
    fromEmail:     fromEmail || undefined,
    platform:      platform || 'google',
    reviewUrl:     reviewUrl || '#',
    customMessage: customMessage?.trim() || undefined,
    hasLogo:       !!logoBase64,
  })

  if (logoBase64) {
    html = html.replace('src="cid:logo"', `src="${logoBase64}"`)
  }

  return NextResponse.json({ html })
}
