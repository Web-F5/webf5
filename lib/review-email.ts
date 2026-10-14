// ── Helpers ────────────────────────────────────────────────────────────────

function platformLabel(platform: string): string {
  return { google: 'Google', facebook: 'Facebook', custom: 'Trustpilot' }[platform] ?? 'Review'
}

function platformButtonColor(platform: string): string {
  return { google: '#4285F4', facebook: '#1877F2', custom: '#00B67A' }[platform] ?? '#6366F1'
}

function platformIcon(platform: string): string {
  if (platform === 'google') {
    return `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-right:8px;">
      <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>`
  }
  if (platform === 'facebook') {
    return `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-right:8px;">
      <path fill="#fff" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>`
  }
  // Trustpilot star
  return `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-right:8px;">
    <path fill="#fff" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>`
}

// ── Main builder ────────────────────────────────────────────────────────────

export interface ReviewEmailData {
  recipientName:  string
  fromBusiness:   string
  platform:       string
  reviewUrl:      string
  customMessage?: string
  /** When set, the CTA links to the rating page instead of the review URL directly */
  ratingUrl?:     string
}

export function buildReviewEmailHtml(d: ReviewEmailData): string {
  const { recipientName, fromBusiness, platform, reviewUrl, customMessage, ratingUrl } = d
  const platformName  = platformLabel(platform)
  const buttonColor   = platformButtonColor(platform)
  const icon          = platformIcon(platform)
  const firstName     = recipientName.split(' ')[0]
  const useFilter     = !!ratingUrl

  const defaultNote = `It was a pleasure working with you — I hope everything has been going well since.`
  const note = customMessage?.trim() || defaultNote

  const ctaHref  = useFilter ? ratingUrl! : reviewUrl
  const ctaLabel = useFilter
    ? `Rate your experience with ${fromBusiness}`
    : `Leave us a review on ${platformName}`
  const bodyAsk = useFilter
    ? `We'd love to hear how your experience was. It only takes a moment, and your feedback means a lot to a small business like ours.`
    : `If you were happy with our service, we'd really appreciate you taking 2 minutes to leave us a review on ${platformName}. Reviews make a genuine difference for a small business like ours.`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A quick favour from ${fromBusiness}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:32px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- ═══ HEADER ═══ -->
    <tr><td style="background:#0A0F1E;border-radius:16px 16px 0 0;padding:36px 40px 32px;">
      <div style="font-size:22px;font-weight:800;color:#FFFFFF;margin-bottom:6px;">${fromBusiness}</div>
      <div style="font-size:14px;color:#64748B;">A quick favour</div>
    </td></tr>

    <!-- ═══ BODY ═══ -->
    <tr><td style="background:#FFFFFF;padding:36px 40px;">
      <p style="font-size:16px;color:#1E293B;margin:0 0 20px;line-height:1.7;">Hi ${firstName},</p>
      <p style="font-size:15px;color:#334155;margin:0 0 20px;line-height:1.7;">${note}</p>
      <p style="font-size:15px;color:#334155;margin:0 0 28px;line-height:1.7;">${bodyAsk}</p>

      <!-- CTA Button -->
      <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td style="background:${buttonColor};border-radius:50px;padding:14px 32px;">
            <a href="${ctaHref}" style="color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;">
              ${useFilter ? '★ ' : icon}${ctaLabel}
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size:13px;color:#94A3B8;margin:0;line-height:1.6;">
        No pressure at all — if now isn't a good time, feel free to ignore this. And if there's anything we could have done better, just reply to this email — we read every response.
      </p>
    </td></tr>

    <!-- ═══ SIGN OFF ═══ -->
    <tr><td style="background:#F8FAFC;padding:24px 40px;border-top:1px solid #E2E8F0;">
      <p style="font-size:14px;color:#334155;margin:0 0 4px;font-weight:600;">Thanks for your time,</p>
      <p style="font-size:14px;color:#64748B;margin:0;">${fromBusiness}</p>
    </td></tr>

    <!-- ═══ FOOTER ═══ -->
    <tr><td style="background:#0A0F1E;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
      <p style="font-size:11px;color:#334155;margin:0;line-height:1.6;">
        Sent from <a href="https://webf5.com.au" style="color:#6366F1;text-decoration:none;">Web F5</a> Bulk Review Finder ·
        <a href="mailto:contact@webf5.au" style="color:#475569;text-decoration:none;">Contact us</a> to send your own review requests
      </p>
    </td></tr>

  </table>
  </td></tr>
</table>

</body>
</html>`
}

export function buildReviewEmailSubject(fromBusiness: string, platform: string): string {
  const name = platformLabel(platform)
  return `Quick favour — would you mind leaving us a ${name} review?`
}
