import React from 'react'
import { Document, Page, View, Text, StyleSheet, renderToBuffer } from '@react-pdf/renderer'

export interface AuditReportData {
  lcp:            number
  pageSpeedScore?: number | null
  grade:          string
  overallScore:   number
  ssl:            boolean
  hasSitemap:     boolean
  content: {
    metaTitle:       string | null
    metaDesc:        string | null
    h1:              string | null
    metaTitleLen?:   number | null
    metaDescLen?:    number | null
    hasContact:      boolean
    hasCta:          boolean
    hasTapToCall?:   boolean
    hasSchema?:      boolean
    hasAnalytics?:   boolean
    hasMetaPixel?:   boolean
    hasGoogleAds?:   boolean
    imagesTotal?:    number
    imagesMissingAlt?: number
  }
  url: string
}

// ── Colours ────────────────────────────────────────────────────────────────

const C = {
  navy:    '#0A0F1E',
  dark:    '#111827',
  indigo:  '#6366F1',
  white:   '#FFFFFF',
  slate:   '#94A3B8',
  light:   '#F1F5F9',
  border:  '#E2E8F0',
  pass:    '#22C55E',
  fail:    '#EF4444',
  amber:   '#F59E0B',
  lime:    '#84CC16',
}

function gradeColor(grade: string): string {
  return { A: C.pass, B: C.lime, C: C.amber, D: C.fail }[grade] ?? C.indigo
}

function coverHeadline(grade: string): string {
  return {
    A: 'Looking good.',
    B: 'A solid start.',
    C: 'Room to improve.',
    D: 'Action needed.',
  }[grade] ?? 'Here are your results.'
}

function coverSubline(grade: string): string {
  return {
    A: 'Your site is performing well across the fundamentals. There may still be conversion and design improvements worth exploring.',
    B: 'Your site has a solid foundation, but a few key gaps are worth addressing to get more enquiries.',
    C: 'Several issues are holding your site back. The findings below show exactly what to fix first.',
    D: 'Multiple significant issues were found. Fixing these could meaningfully increase the enquiries your site generates.',
  }[grade] ?? ''
}

// ── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Cover
  coverPage:       { backgroundColor: C.navy, padding: 50, flexDirection: 'column', justifyContent: 'space-between' },
  brandText:       { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.indigo, marginBottom: 4 },
  coverLabel:      { fontSize: 9, fontFamily: 'Helvetica', color: C.slate, letterSpacing: 2 },
  coverHeadline:   { fontSize: 42, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 8, marginTop: 48 },
  coverBizName:    { fontSize: 22, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 4 },
  coverUrl:        { fontSize: 11, fontFamily: 'Helvetica', color: C.slate, marginBottom: 40 },
  coverSubline:    { fontSize: 12, fontFamily: 'Helvetica', color: C.slate, lineHeight: 1.6, maxWidth: 380 },
  gradeRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  gradeCircle:     { width: 72, height: 72, borderRadius: 36, borderWidth: 4, alignItems: 'center', justifyContent: 'center', marginRight: 20 },
  gradeLetter:     { fontSize: 34, fontFamily: 'Helvetica-Bold' },
  scoreBlock:      { flexDirection: 'column' },
  scoreNumber:     { fontSize: 36, fontFamily: 'Helvetica-Bold', lineHeight: 1 },
  scoreLabel:      { fontSize: 11, fontFamily: 'Helvetica', color: C.slate, marginTop: 2 },
  coverFooterRow:  { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 16 },
  coverFooterText: { fontSize: 9, fontFamily: 'Helvetica', color: C.slate },

  // Report page
  reportPage:  { backgroundColor: C.white, padding: 44, flexDirection: 'column' },
  pageHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  pageTitle:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.dark },
  pageSubtitle:{ fontSize: 9, fontFamily: 'Helvetica', color: C.slate },
  pageBrand:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.indigo },

  summaryRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.light, borderRadius: 8, padding: 14, marginBottom: 20 },
  summaryScore:{ fontSize: 28, fontFamily: 'Helvetica-Bold', marginRight: 12 },
  summaryLabel:{ fontSize: 11, fontFamily: 'Helvetica', color: C.slate },

  sectionTitle:{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.indigo, letterSpacing: 1.5, marginBottom: 8, marginTop: 16 },
  sectionLine: { borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 4 },

  checkRow:    { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  checkDot:    { width: 8, height: 8, borderRadius: 4, marginTop: 3, marginRight: 10, flexShrink: 0 },
  checkLabel:  { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  checkDetail: { fontSize: 9, fontFamily: 'Helvetica', color: C.slate, lineHeight: 1.4 },
  checkTag:    { fontSize: 8, fontFamily: 'Helvetica', color: C.indigo, marginLeft: 6 },

  ctaBox:      { backgroundColor: '#EEF2FF', borderRadius: 8, padding: 20, marginTop: 20, alignItems: 'center' },
  ctaTitle:    { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.dark, marginBottom: 6, textAlign: 'center' },
  ctaBody:     { fontSize: 10, fontFamily: 'Helvetica', color: C.slate, textAlign: 'center', lineHeight: 1.5, marginBottom: 12 },
  ctaButton:   { backgroundColor: C.indigo, borderRadius: 6, paddingHorizontal: 24, paddingVertical: 10 },
  ctaButtonText:{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.white },
  ctaContact:  { fontSize: 9, fontFamily: 'Helvetica', color: C.slate, marginTop: 8, textAlign: 'center' },
})

// ── Components ─────────────────────────────────────────────────────────────

function CheckRow({ pass, label, detail, tag }: { pass: boolean; label: string; detail: string; tag?: string }) {
  return (
    <View style={s.checkRow}>
      <View style={[s.checkDot, { backgroundColor: pass ? C.pass : C.fail }]} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[s.checkLabel, { color: pass ? C.dark : C.fail }]}>{label}</Text>
          {tag ? <Text style={s.checkTag}>{tag}</Text> : null}
        </View>
        <Text style={s.checkDetail}>{detail}</Text>
      </View>
    </View>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={s.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={s.sectionLine} />
      {children}
    </View>
  )
}

// ── Pages ──────────────────────────────────────────────────────────────────

function CoverPage({ report, biz, date }: { report: AuditReportData; biz: string; date: string }) {
  const gc = gradeColor(report.grade)
  return (
    <Page size="A4" style={s.coverPage}>
      {/* Top */}
      <View>
        <Text style={s.brandText}>Web F5</Text>
        <Text style={s.coverLabel}>WEBSITE AUDIT REPORT</Text>
      </View>

      {/* Centre */}
      <View>
        <Text style={s.coverHeadline}>{coverHeadline(report.grade)}</Text>
        <Text style={s.coverBizName}>{biz}</Text>
        <Text style={s.coverUrl}>{report.url}</Text>

        <View style={s.gradeRow}>
          <View style={[s.gradeCircle, { borderColor: gc }]}>
            <Text style={[s.gradeLetter, { color: gc }]}>{report.grade}</Text>
          </View>
          <View style={s.scoreBlock}>
            <Text style={[s.scoreNumber, { color: gc }]}>{report.overallScore}</Text>
            <Text style={s.scoreLabel}>out of 100</Text>
          </View>
        </View>

        <Text style={s.coverSubline}>{coverSubline(report.grade)}</Text>
      </View>

      {/* Footer */}
      <View style={s.coverFooterRow}>
        <Text style={s.coverFooterText}>Prepared by Web F5 · webf5.com.au</Text>
        <Text style={s.coverFooterText}>{date}</Text>
      </View>
    </Page>
  )
}

function FindingsPage({ report, biz }: { report: AuditReportData; biz: string }) {
  const { lcp, ssl, hasSitemap, content } = report
  const allImagesAlt = (content.imagesTotal ?? 0) === 0 || (content.imagesMissingAlt ?? 0) === 0
  const speedPass = lcp < 4

  const lcpDetail = lcp < 2.5
    ? `${lcp.toFixed(1)}s — fast. Visitors stay and explore.`
    : lcp < 4
    ? `${lcp.toFixed(1)}s — acceptable but can be improved.`
    : `${lcp.toFixed(1)}s — slow. Many mobile visitors leave before the page finishes loading.`

  const totalChecks = 14
  const passCount = [
    ssl, speedPass, !!content.metaTitle, !!content.metaDesc, !!content.h1,
    !!hasSitemap, !!content.hasSchema, allImagesAlt,
    !!content.hasAnalytics, !!content.hasMetaPixel, !!content.hasGoogleAds,
    !!content.hasTapToCall, content.hasContact, content.hasCta,
  ].filter(Boolean).length

  const gc = gradeColor(report.grade)

  return (
    <Page size="A4" style={s.reportPage}>
      {/* Page header */}
      <View style={s.pageHeader}>
        <View>
          <Text style={s.pageTitle}>Audit Findings — {biz}</Text>
          <Text style={s.pageSubtitle}>{report.url}</Text>
        </View>
        <Text style={s.pageBrand}>Web F5</Text>
      </View>

      {/* Summary */}
      <View style={s.summaryRow}>
        <Text style={[s.summaryScore, { color: gc }]}>{passCount}/{totalChecks}</Text>
        <View>
          <Text style={[s.checkLabel, { color: C.dark, fontSize: 12 }]}>checks passed</Text>
          <Text style={s.summaryLabel}>Overall score: {report.overallScore}/100 · Grade {report.grade}</Text>
        </View>
      </View>

      {/* Mobile Speed */}
      <Section title="Mobile Speed">
        <CheckRow
          pass={speedPass}
          label={`Load time — ${lcp.toFixed(1)}s`}
          tag={report.pageSpeedScore != null ? `PageSpeed ${report.pageSpeedScore}/100` : undefined}
          detail={lcpDetail}
        />
      </Section>

      {/* Search & SEO */}
      <Section title="Search &amp; SEO">
        <CheckRow
          pass={ssl}
          label="Secure connection (HTTPS)"
          detail={ssl ? 'Your site is secure. Visitors and Google trust it.' : 'Browsers display a "Not Secure" warning — this loses visitors and hurts your Google ranking.'}
        />
        <CheckRow
          pass={!!content.metaTitle}
          label="Page title"
          tag={content.metaTitleLen != null ? `${content.metaTitleLen} chars` : undefined}
          detail={content.metaTitle ? `"${content.metaTitle}"` : 'Missing — Google has nothing to show in search results.'}
        />
        <CheckRow
          pass={!!content.metaDesc}
          label="Meta description"
          tag={content.metaDescLen != null ? `${content.metaDescLen} chars${content.metaDescLen < 120 || content.metaDescLen > 155 ? ' · aim 120–155' : ' · good'}` : undefined}
          detail={content.metaDesc ? 'Set — you control what people read before clicking your result.' : 'Missing — Google will choose what to display instead of you.'}
        />
        <CheckRow
          pass={!!content.h1}
          label="Page heading (H1)"
          detail={content.h1 ? `"${content.h1}"` : 'Missing — no clear message for visitors or search engines.'}
        />
        <CheckRow
          pass={!!hasSitemap}
          label="XML sitemap"
          detail={hasSitemap ? 'Found — Google can discover every page on your site.' : 'Not found — Google has a harder time finding and indexing all your pages.'}
        />
        <CheckRow
          pass={!!content.hasSchema}
          label="Structured data (schema)"
          detail={content.hasSchema ? 'Found — Google and AI assistants can read your business details.' : 'Not found — adding LocalBusiness schema helps you appear in local results and AI assistant answers.'}
        />
        <CheckRow
          pass={allImagesAlt}
          label="Image alt text"
          tag={content.imagesTotal != null ? `${(content.imagesTotal ?? 0) - (content.imagesMissingAlt ?? 0)}/${content.imagesTotal} described` : undefined}
          detail={allImagesAlt ? 'All images are described — good for accessibility and search engines.' : `${content.imagesMissingAlt} image${(content.imagesMissingAlt ?? 0) > 1 ? 's' : ''} missing alt text — screen readers and Google can't read these.`}
        />
      </Section>

      {/* Tracking */}
      <Section title="Tracking">
        <CheckRow
          pass={!!content.hasAnalytics}
          label="Google Analytics / Tag Manager"
          detail={content.hasAnalytics ? 'Found — you can see which pages and sources bring in enquiries.' : 'Not found — without analytics there is no way to know what brings in enquiries.'}
        />
        <CheckRow
          pass={!!content.hasMetaPixel}
          label="Meta (Facebook) Pixel"
          detail={content.hasMetaPixel ? 'Found — you can retarget visitors with Facebook and Instagram ads.' : 'Not found — adding the Pixel lets you retarget website visitors with social ads.'}
        />
        <CheckRow
          pass={!!content.hasGoogleAds}
          label="Google Ads conversion tag"
          detail={content.hasGoogleAds ? 'Found — you can measure which ad clicks become enquiries.' : 'Not found — if you run Google Ads, a conversion tag shows which keywords generate leads.'}
        />
      </Section>

      {/* Enquiry Path */}
      <Section title="Enquiry Path">
        <CheckRow
          pass={!!content.hasTapToCall}
          label="Tap-to-call phone link"
          detail={content.hasTapToCall ? 'A tap-to-call link is in place — mobile visitors can call with one tap.' : 'Not found — mobile visitors have to manually copy-paste your number, and most won\'t bother.'}
        />
        <CheckRow
          pass={content.hasContact}
          label="Contact details on page"
          detail={content.hasContact ? 'Contact details are visible on the page.' : 'Not found — visitors who can\'t reach you quickly will call your competitor.'}
        />
        <CheckRow
          pass={content.hasCta}
          label="Clear call to action"
          detail={content.hasCta ? 'Your page has a clear next step for visitors.' : 'Not found — visitors who are ready to enquire may not know what to do next.'}
        />
      </Section>

      {/* CTA */}
      <View style={s.ctaBox}>
        <Text style={s.ctaTitle}>Want to fix this?</Text>
        <Text style={s.ctaBody}>
          We fix exactly these problems for local businesses across Victoria.{'\n'}
          Book a free 15-minute call and we'll walk through your site together.
        </Text>
        <View style={s.ctaButton}>
          <Text style={s.ctaButtonText}>webf5.com.au/brief</Text>
        </View>
        <Text style={s.ctaContact}>Or call Josh: 0419 510 206 · contact@webf5.au</Text>
      </View>
    </Page>
  )
}

// ── Export ─────────────────────────────────────────────────────────────────

export async function generateAuditPdf(
  report: AuditReportData,
  name: string,
  biz: string,
): Promise<Buffer> {
  const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  const doc = (
    <Document title={`Website Audit — ${biz}`} author="Web F5">
      <CoverPage report={report} biz={biz} date={date} />
      <FindingsPage report={report} biz={biz} />
    </Document>
  )
  return renderToBuffer(doc) as Promise<Buffer>
}
