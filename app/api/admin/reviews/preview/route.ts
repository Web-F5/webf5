import { NextRequest, NextResponse } from 'next/server'
import { buildReviewEmailHtml } from '@/lib/review-email'

export async function POST(req: NextRequest) {
  const { fromBusiness, fromEmail, platform, reviewUrl, customMessage, recipientName, useFilter, logoBase64 } = await req.json()

  // For the browser preview, inject the logo directly as a data URI so it renders in the iframe.
  // (Actual sends use cid: inline attachments instead, since email clients block data URIs.)
  let previewHtml = buildReviewEmailHtml({
    recipientName: recipientName || 'Customer',
    fromBusiness:  fromBusiness || 'Your Business',
    fromEmail:     fromEmail || undefined,
    platform:      platform || 'google',
    reviewUrl:     reviewUrl || '#',
    customMessage: customMessage?.trim() || undefined,
    ratingUrl:     useFilter ? 'https://webf5.com.au/review?t=preview' : undefined,
    hasLogo:       !!logoBase64,
  })

  if (logoBase64) {
    previewHtml = previewHtml.replace('src="cid:logo"', `src="${logoBase64}"`)
  }

  return NextResponse.json({ html: previewHtml })
}
