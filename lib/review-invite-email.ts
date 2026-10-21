export function buildReviewInviteEmailHtml(
  name: string,
  bizName: string,
  reviewCount: number | null,
): string {
  const reviewLine = reviewCount != null && reviewCount > 0
    ? `You have <strong>${reviewCount} reviews</strong>, great start!`
    : `Building up your review count is one of the fastest ways to stand out locally.`

  const toolUrl = 'https://webf5.com.au/resources/review-sender'
  const date    = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A free tool for ${bizName}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:32px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- HERO -->
    <tr><td style="background:#0A0F1E;border-radius:16px 16px 0 0;padding:40px 40px 36px;">
      <table cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
        <tr>
          <td style="padding-right:10px;vertical-align:middle;">
            <img src="https://webf5.com.au/images/web-app-manifest-512x512.png" alt="Web F5" width="36" height="36" style="display:block;border:0;" />
          </td>
          <td style="vertical-align:middle;">
            <div style="font-size:20px;font-weight:800;color:#6366F1;line-height:1;">Web F5</div>
          </td>
        </tr>
      </table>
      <div style="font-size:10px;color:#475569;letter-spacing:2px;text-transform:uppercase;margin-bottom:36px;">${date}</div>

      <div style="font-size:32px;font-weight:800;color:#FFFFFF;margin-bottom:12px;line-height:1.2;">
        Get more reviews.<br/>
        <span style="color:#6366F1;">The easy way.</span>
      </div>
    </td></tr>

    <!-- BODY -->
    <tr><td style="background:#FFFFFF;padding:36px 40px;">

      <p style="font-size:15px;color:#1E293B;line-height:1.7;margin:0 0 12px;">
        Hi ${name}, we built a free tool for local businesses.
      </p>

      <p style="font-size:15px;color:#1E293B;line-height:1.7;margin:0 0 20px;">
        ${reviewLine}
      </p>

      <p style="font-size:15px;color:#1E293B;line-height:1.7;margin:0 0 24px;">
        Most businesses find it awkward to ask for reviews, so they don't, and miss out.
        We've built a simple, professional Review Request Sender that sends a personalised
        review request to multiple clients in less than a minute.
      </p>

      <p style="font-size:14px;color:#475569;margin:0 0 28px;line-height:1.6;">
        <strong style="color:#1E293B;">No login. No setup. Completely free.</strong>
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td align="center">
          <a href="${toolUrl}"
            style="display:inline-block;background:#4F46E5;color:#FFFFFF;font-weight:700;font-size:15px;padding:16px 40px;border-radius:50px;text-decoration:none;">
            Try our Review Request Sender →
          </a>
        </td></tr>
      </table>

      <p style="font-size:13px;color:#64748B;line-height:1.6;margin:0 0 8px;">
        Works for Google, Facebook, and Trustpilot.
      </p>
      <p style="font-size:13px;color:#94A3B8;line-height:1.6;margin:0;">
        We do not collect their data.
      </p>

    </td></tr>

    <!-- CTA BAND -->
    <tr><td style="background:#EEF2FF;padding:28px 40px;text-align:center;">
      <div style="font-size:14px;color:#4338CA;line-height:1.6;margin-bottom:16px;">
        Need help getting more from your online presence?<br/>
        We would love to hear from you.
      </div>
      <a href="mailto:contact@webf5.au?subject=${encodeURIComponent(`${bizName} - quick question`)}"
        style="display:inline-block;background:#4F46E5;color:#FFFFFF;font-weight:700;font-size:13px;padding:12px 28px;border-radius:50px;text-decoration:none;">
        Get in touch →
      </a>
    </td></tr>

    <!-- FOOTER -->
    <tr><td style="background:#0A0F1E;border-radius:0 0 16px 16px;padding:24px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:top;">
            <div style="font-size:14px;font-weight:800;color:#6366F1;margin-bottom:4px;">Web F5</div>
            <div style="font-size:11px;color:#475569;">Web design &amp; development · Central Victoria</div>
          </td>
          <td style="text-align:right;vertical-align:top;">
            <div style="font-size:11px;color:#475569;margin-bottom:3px;">
              <a href="tel:+61419510206" style="color:#6366F1;text-decoration:none;">0419 510 206</a>
            </div>
            <div style="font-size:11px;color:#475569;">
              <a href="mailto:contact@webf5.au" style="color:#475569;text-decoration:none;">contact@webf5.au</a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>

  </table>
  </td></tr>
</table>

</body>
</html>`
}
