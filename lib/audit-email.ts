import type { AuditReportData } from './audit-pdf'

// ── Helpers ────────────────────────────────────────────────────────────────

function gradeColor(grade: string): string {
  return { A: '#22C55E', B: '#84CC16', C: '#F59E0B', D: '#EF4444' }[grade] ?? '#6366F1'
}

function subScoreColor(score: number): string {
  if (score >= 80) return '#22C55E'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function coverHeadline(grade: string): string {
  return { A: 'Looking good.', B: 'A solid start.', C: 'Room to improve.', D: 'Action needed.' }[grade] ?? 'Here are your results.'
}

function tick(pass: boolean): string {
  return pass
    ? '<span style="color:#22C55E;font-size:14px;">✔</span>'
    : '<span style="color:#EF4444;font-size:14px;">✖</span>'
}

function checkRow(pass: boolean, label: string, detail: string, tag?: string): string {
  const color = pass ? '#111827' : '#EF4444'
  return `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #F1F5F9;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" width="100%"><tr>
          <td style="width:24px;padding-top:1px;vertical-align:top;">${tick(pass)}</td>
          <td>
            <div style="font-size:13px;font-weight:600;color:${color};margin-bottom:2px;">
              ${label}${tag ? `&nbsp;<span style="font-size:11px;font-weight:400;color:#6366F1;">${tag}</span>` : ''}
            </div>
            <div style="font-size:12px;color:#64748B;line-height:1.5;">${detail}</div>
          </td>
        </tr></table>
      </td>
    </tr>`
}

function infoRow(label: string, detail: string): string {
  return `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #F1F5F9;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" width="100%"><tr>
          <td style="width:24px;padding-top:1px;vertical-align:top;"><span style="color:#94A3B8;font-size:14px;">●</span></td>
          <td>
            <div style="font-size:13px;font-weight:600;color:#111827;margin-bottom:2px;">${label}</div>
            <div style="font-size:12px;color:#64748B;line-height:1.5;">${detail}</div>
          </td>
        </tr></table>
      </td>
    </tr>`
}

function sectionHeader(title: string): string {
  return `
    <tr>
      <td style="padding:20px 16px 4px;background:#F8FAFC;">
        <div style="font-size:10px;font-weight:700;color:#6366F1;letter-spacing:1.5px;text-transform:uppercase;">${title}</div>
        <div style="height:1px;background:#E2E8F0;margin-top:6px;"></div>
      </td>
    </tr>`
}

function metricCell(val: string, label: string, color: string): string {
  return `<td style="width:25%;text-align:center;padding:10px 6px;background:#F8FAFC;border-radius:6px;">
    <div style="font-size:16px;font-weight:800;color:${color};">${val}</div>
    <div style="font-size:10px;color:#94A3B8;margin-top:2px;">${label}</div>
  </td>`
}

function speedColor(v: number | null | undefined, good: number, ok: number): string {
  if (v == null) return '#94A3B8'
  if (v <= good) return '#22C55E'
  if (v <= ok)   return '#F59E0B'
  return '#EF4444'
}

// ── Main builder ───────────────────────────────────────────────────────────

export function buildAuditEmailHtml(
  name: string,
  biz: string,
  report: AuditReportData,
): string {
  const { lcp, ssl, hasSitemap, content, grade, overallScore, subScores } = report
  const gc = gradeColor(grade)
  const allImagesAlt  = (content.imagesTotal ?? 0) === 0 || (content.imagesMissingAlt ?? 0) === 0
  const mobilePass    = lcp < 4
  const desktopPass   = (report.desktopScore ?? 0) >= 80
  const accessPass    = (report.lighthouseAccessibility ?? 0) >= 80
  const bestPractPass = (report.lighthouseBestPractices ?? 0) >= 80

  const lcpDetail = lcp < 2.5
    ? `${lcp.toFixed(1)}s: fast. Visitors stay and explore.`
    : lcp < 4
    ? `${lcp.toFixed(1)}s: acceptable, but there's room to improve.`
    : `${lcp.toFixed(1)}s: slow. Roughly ${Math.min(Math.round((lcp - 2) * 10), 70)}% of mobile visitors leave before the page finishes loading.`

  const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Website Audit: ${biz}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:32px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- ═══ HERO (dark) ═══ -->
    <tr><td style="background:#0A0F1E;border-radius:16px 16px 0 0;padding:40px 40px 36px;">

      <!-- Brand -->
      <table cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
        <tr>
          <td style="padding-right:10px;vertical-align:middle;">
            <img src="https://webf5.com.au/images/web-app-manifest-512x512.png" alt="Web F5" width="36" height="36"
              style="display:block;border:0;" />
          </td>
          <td style="vertical-align:middle;">
            <div style="font-size:20px;font-weight:800;color:#6366F1;line-height:1;">Web F5</div>
          </td>
        </tr>
      </table>
      <div style="font-size:10px;color:#475569;letter-spacing:2px;text-transform:uppercase;margin-bottom:36px;">Website Audit Report · ${date}</div>

      <!-- Grade + score -->
      <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding-right:20px;">
            <div style="width:80px;height:80px;border-radius:50%;border:4px solid ${gc};display:flex;align-items:center;justify-content:center;text-align:center;line-height:80px;">
              <span style="font-size:38px;font-weight:900;color:${gc};line-height:80px;display:block;">${grade}</span>
            </div>
          </td>
          <td style="vertical-align:middle;">
            <div style="font-size:42px;font-weight:900;color:${gc};line-height:1;">${overallScore}</div>
            <div style="font-size:13px;color:#64748B;margin-top:2px;">out of 100</div>
          </td>
        </tr>
      </table>

      ${subScores ? `<!-- Sub-scores -->
      <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;width:100%;">
        <tr>
          ${[
            ['On-Page', subScores.onPage],
            ['Performance', subScores.performance],
            ['Usability', subScores.usability],
            ['Social', subScores.social],
          ].map(([label, score]) => `
          <td style="width:25%;padding:2px;">
            <div style="background:#0F1729;border-radius:8px;padding:12px 8px;text-align:center;">
              <div style="font-size:20px;font-weight:800;color:${subScoreColor(score as number)};">${score}</div>
              <div style="font-size:10px;color:#475569;margin-top:3px;">${label}</div>
            </div>
          </td>`).join('')}
        </tr>
      </table>` : ''}

      <!-- Headline -->
      <div style="font-size:28px;font-weight:800;color:#FFFFFF;margin-bottom:8px;">${coverHeadline(grade)}</div>
      <div style="font-size:14px;color:#94A3B8;line-height:1.6;margin-bottom:8px;">
        Hi ${name}, here's the audit for <strong style="color:#CBD5E1;">${biz}</strong>.
      </div>
      <div style="font-size:12px;color:#475569;">${report.url}</div>
    </td></tr>

    <!-- ═══ FINDINGS ═══ -->
    <tr><td style="background:#FFFFFF;padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0">

        ${sectionHeader('Performance')}
        <!-- Core Web Vitals grid -->
        <tr><td style="padding:12px 16px 4px;">
          <table width="100%" cellpadding="4" cellspacing="4">
            <tr>
              ${metricCell(`${lcp.toFixed(1)}s`,  'Mobile LCP',  speedColor(lcp, 2.5, 4))}
              ${metricCell(report.mobileFcp != null ? `${report.mobileFcp.toFixed(1)}s` : '—', 'Mobile FCP', speedColor(report.mobileFcp, 1.8, 3))}
              ${metricCell(report.mobileCls != null ? report.mobileCls.toFixed(3) : '—',        'Mobile CLS', speedColor(report.mobileCls, 0.1, 0.25))}
              ${metricCell(report.mobileTbt != null ? `${Math.round(report.mobileTbt)}ms` : '—','Mobile TBT', speedColor(report.mobileTbt, 200, 600))}
            </tr>
            <tr>
              ${metricCell(report.desktopLcp != null ? `${report.desktopLcp.toFixed(1)}s` : '—', 'Desktop LCP', speedColor(report.desktopLcp, 2.5, 4))}
              ${metricCell(report.desktopFcp != null ? `${report.desktopFcp.toFixed(1)}s` : '—', 'Desktop FCP', speedColor(report.desktopFcp, 1.8, 3))}
              ${metricCell(report.desktopCls != null ? report.desktopCls.toFixed(3) : '—',        'Desktop CLS', speedColor(report.desktopCls, 0.1, 0.25))}
              ${metricCell(report.pageWeightKb != null ? `${report.pageWeightKb} KB` : '—',       'Page Weight', report.pageWeightKb != null ? (report.pageWeightKb < 1024 ? '#22C55E' : report.pageWeightKb < 2048 ? '#F59E0B' : '#EF4444') : '#94A3B8')}
            </tr>
          </table>
        </td></tr>
        ${checkRow(mobilePass,  `Mobile PageSpeed: ${report.pageSpeedScore ?? '—'}/100`,  lcpDetail,                        `LCP ${lcp.toFixed(1)}s`)}
        ${checkRow(desktopPass, `Desktop PageSpeed: ${report.desktopScore ?? '—'}/100`,   desktopPass ? 'Desktop speed is good.' : 'Desktop score is below 80. Check image sizes and render-blocking resources.', report.desktopLcp != null ? `LCP ${report.desktopLcp.toFixed(1)}s` : undefined)}
        ${checkRow(ssl, 'Secure connection (HTTPS)', ssl ? 'Your site is secure. Visitors and Google trust it.' : 'Browsers display a "Not Secure" warning. This loses visitors and hurts your Google ranking.')}

        ${sectionHeader('On-Page SEO')}
        ${checkRow(!!content.metaTitle, 'Page title', content.metaTitle ? `"${content.metaTitle}"` : 'Missing. Google has nothing to show in search results.', content.metaTitleLen != null ? `${content.metaTitleLen} chars` : undefined)}
        ${checkRow(!!content.metaDesc, 'Meta description', content.metaDesc ? 'Set. You control what people read before clicking your result.' : 'Missing. Google will choose what to display instead of you.', content.metaDescLen != null ? `${content.metaDescLen} chars${(content.metaDescLen < 120 || content.metaDescLen > 155) ? ' · aim 120–155' : ' · good'}` : undefined)}
        ${checkRow(!!content.h1, 'Page heading (H1)', content.h1 ? `"${content.h1}"` : 'Missing. No clear message for visitors or search engines.')}
        ${checkRow(!!content.hasCanonical, 'Canonical tag', content.hasCanonical ? 'Set. Prevents duplicate-content issues.' : 'Missing. Add a canonical tag to tell Google which URL is authoritative.')}
        ${checkRow(!!hasSitemap, 'XML sitemap', hasSitemap ? 'Found. Google can discover every page on your site.' : 'Not found. Google has a harder time finding and indexing all your pages.')}
        ${checkRow(!!report.hasRobotsTxt, 'robots.txt', report.hasRobotsTxt ? 'Found. Search engine crawlers have guidance on your site.' : 'Not found. Add a robots.txt file to guide crawlers.')}
        ${checkRow(!!content.hasSchema, 'Structured data (schema)', content.hasSchema ? 'Found. Google and AI assistants can read your business details.' : 'Not found. Adding LocalBusiness schema helps you appear in local results and AI assistant answers.')}
        ${checkRow(allImagesAlt, 'Image alt text', allImagesAlt ? 'All images are described. Good for accessibility and search engines.' : `${content.imagesMissingAlt} image${(content.imagesMissingAlt ?? 0) > 1 ? 's' : ''} missing alt text. Screen readers and Google can't read these.`, content.imagesTotal != null ? `${(content.imagesTotal ?? 0) - (content.imagesMissingAlt ?? 0)}/${content.imagesTotal} described` : undefined)}
        ${content.hasFavicon != null ? checkRow(!!content.hasFavicon, 'Favicon', content.hasFavicon ? 'Favicon set. Adds brand recognition in browser tabs and search results.' : 'No favicon detected. A small icon builds recognition in tabs and bookmarks.') : ''}
        ${content.hasLang != null ? checkRow(!!content.hasLang, 'Language declaration', content.hasLang ? 'Page declares its language. Helps search engines serve the right audience.' : 'No lang attribute on &lt;html&gt;. Add lang="en" or the appropriate language code.') : ''}
        ${content.linkCount != null ? infoRow(`${content.linkCount} links on page`, 'Total anchor links found: internal and external combined.') : ''}
        ${report.hasLlmsTxt != null ? checkRow(!!report.hasLlmsTxt, 'llms.txt (AI readiness)', report.hasLlmsTxt ? 'llms.txt found. Helps AI assistants understand your site content.' : 'No llms.txt file. This emerging standard helps AI models like ChatGPT better understand your business.') : ''}

        ${sectionHeader('Usability')}
        ${checkRow(accessPass,    `Accessibility: ${report.lighthouseAccessibility ?? '—'}/100`,   accessPass    ? 'Good accessibility score. Your site works well for all users and search engines.' : 'Accessibility score below 80. Fix contrast, missing labels, and alt text to help all visitors.')}
        ${checkRow(bestPractPass, `Best Practices: ${report.lighthouseBestPractices ?? '—'}/100`, bestPractPass ? 'Site follows best practices.' : 'Some best-practice issues detected. Check browser console errors, HTTPS, and deprecated APIs.')}
        ${content.hasViewport != null ? checkRow(!!content.hasViewport, 'Mobile viewport', content.hasViewport ? 'Responsive viewport is set. The site scales correctly on mobile.' : 'No viewport meta tag. The site may not display correctly on mobile devices.') : ''}
        ${checkRow(!!content.hasTapToCall, 'Tap-to-call phone link', content.hasTapToCall ? 'A tap-to-call link is in place. Mobile visitors can call with one tap.' : "Not found. Mobile visitors have to manually copy-paste your number, and most won't bother.")}

        ${sectionHeader('Social &amp; Sharing')}
        ${checkRow(!!content.hasOpenGraph,   'Open Graph tags',      content.hasOpenGraph   ? 'Set. Your site shows a rich preview when shared on Facebook, LinkedIn, and iMessage.' : 'Missing. Without OG tags, shared links show a plain URL. Add og:title, og:description, and og:image.')}
        ${checkRow(!!content.hasTwitterCard, 'Twitter / X card tags', content.hasTwitterCard ? 'Set. Links shared on X/Twitter show a rich card.' : 'Missing. Add Twitter card meta tags for better link previews on X and Twitter.')}
        ${checkRow(!!content.hasMetaPixel,   'Meta (Facebook) Pixel', content.hasMetaPixel   ? 'Found. You can retarget visitors with Facebook and Instagram ads.' : 'Not found. Adding the Pixel lets you retarget website visitors with social ads.')}

        ${sectionHeader('Tracking')}
        ${checkRow(!!content.hasAnalytics, 'Google Analytics / Tag Manager', content.hasAnalytics ? 'Found. You can see which pages and sources bring in enquiries.' : 'Not found. Without analytics there is no way to know what brings in enquiries.')}
        ${checkRow(!!content.hasGoogleAds, 'Google Ads conversion tag', content.hasGoogleAds ? 'Found. You can measure which ad clicks become enquiries.' : 'Not found. If you run Google Ads, a conversion tag shows which keywords generate leads.')}

        ${sectionHeader('Enquiry Path')}
        ${checkRow(content.hasContact, 'Contact details on page', content.hasContact ? 'Contact details are visible on the page.' : "Not found. Visitors who can't reach you quickly will call your competitor.")}
        ${checkRow(content.hasCta, 'Clear call to action', content.hasCta ? 'Your page has a clear next step for visitors.' : 'Not found. Visitors who are ready to enquire may not know what to do next.')}

      </table>
    </td></tr>

    <!-- ═══ CTA ═══ -->
    <tr><td style="background:#EEF2FF;padding:36px 40px;text-align:center;">
      <div style="font-size:20px;font-weight:800;color:#1E1B4B;margin-bottom:10px;">
        ${grade === 'A' ? 'Want to go further?' : 'Ready to fix this?'}
      </div>
      <div style="font-size:14px;color:#4338CA;line-height:1.6;margin-bottom:24px;max-width:400px;margin-left:auto;margin-right:auto;">
        ${grade === 'A'
          ? 'We can review your conversion flow, design, and content to find growth opportunities beyond the basics.'
          : 'We fix exactly these problems for local businesses across Victoria. Book a free 15-minute call, no obligation.'}
      </div>
      <a href="mailto:contact@webf5.au?subject=${encodeURIComponent(`${biz} - request for a 15 minute call.`)}&body=${encodeURIComponent(`Please contact ${biz} regarding the items identified on the website audit.`)}" style="display:inline-block;background:#4F46E5;color:#FFFFFF;font-weight:700;font-size:14px;padding:14px 32px;border-radius:50px;text-decoration:none;">
        Book a free 15-minute call →
      </a>
      <div style="margin-top:16px;font-size:12px;color:#6366F1;">
        The full report PDF is attached to this email.
      </div>
    </td></tr>

    <!-- ═══ FOOTER ═══ -->
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
