import React from 'react'
import { Document, Page, View, Text, StyleSheet, renderToBuffer, Link } from '@react-pdf/renderer'

// ── Colours ────────────────────────────────────────────────────────────────

const C = {
  navy:   '#0A0F1E',
  dark:   '#111827',
  indigo: '#6366F1',
  white:  '#FFFFFF',
  slate:  '#94A3B8',
  light:  '#F1F5F9',
  border: '#E2E8F0',
  muted:  '#64748B',
  label:  '#475569',
}

// ── Styles ────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: C.light,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: C.navy,
    paddingHorizontal: 40,
    paddingTop: 36,
    paddingBottom: 32,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.indigo,
  },
  dateLine: {
    fontSize: 8,
    color: C.label,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 28,
    marginTop: 2,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 11,
    color: C.slate,
    lineHeight: 1.6,
    marginBottom: 4,
  },
  heroNote: {
    fontSize: 9,
    color: C.label,
    marginTop: 8,
  },
  body: {
    backgroundColor: C.white,
    marginHorizontal: 0,
    paddingBottom: 8,
  },
  sectionHeader: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.indigo,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionRule: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.light,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 3,
    marginRight: 12,
    marginTop: 1,
  },
  numText: {
    fontSize: 9,
    color: C.slate,
    marginRight: 4,
    marginTop: 1,
  },
  itemLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
    marginBottom: 2,
  },
  itemDetail: {
    fontSize: 9,
    color: C.muted,
    lineHeight: 1.5,
  },
  cta: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 40,
    paddingVertical: 28,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1E1B4B',
    marginBottom: 6,
    textAlign: 'center',
  },
  ctaBody: {
    fontSize: 11,
    color: '#4338CA',
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: 16,
    maxWidth: 360,
  },
  ctaBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 50,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  ctaBtnText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
  },
  footer: {
    backgroundColor: C.navy,
    paddingHorizontal: 40,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  footerBrand: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: C.indigo,
    marginBottom: 3,
  },
  footerSub: {
    fontSize: 9,
    color: C.label,
  },
  footerLink: {
    fontSize: 9,
    color: C.indigo,
    textDecoration: 'none',
  },
  footerEmail: {
    fontSize: 9,
    color: C.label,
    textDecoration: 'none',
  },
})

// ── Checklist data ────────────────────────────────────────────────────────

interface CheckItem { num: number; label: string; detail: string }

const SECTIONS: { title: string; items: CheckItem[] }[] = [
  {
    title: 'First Impressions',
    items: [
      { num: 1, label: 'Clear headline',         detail: 'Visitors know within 5 seconds what you do and who you serve.' },
      { num: 2, label: 'Professional imagery',   detail: 'Real photos of your work, team, or premises. Not stock photos.' },
      { num: 3, label: 'Mobile-friendly design', detail: 'The site looks and works well on a phone. Over 60% of visitors are on mobile.' },
    ],
  },
  {
    title: 'Trust Signals',
    items: [
      { num: 4,  label: 'Contact details on every page',  detail: 'Phone number visible on every page, not just the contact page.' },
      { num: 5,  label: 'Google reviews / testimonials',  detail: 'At least 3 visible on your homepage. Social proof converts browsers into buyers.' },
      { num: 6,  label: 'SSL certificate (HTTPS)',        detail: 'Padlock icon in the browser bar. Required by Google and expected by visitors.' },
      { num: 7,  label: 'About page',                     detail: 'Real information about the business owner or team. People buy from people.' },
    ],
  },
  {
    title: 'Getting Found on Google',
    items: [
      { num: 8,  label: 'Page title and meta description', detail: 'Every page has a unique, descriptive title under 60 characters.' },
      { num: 9,  label: 'Google Business Profile',         detail: 'Claimed, verified, and linked to your website. Free and essential for local search.' },
      { num: 10, label: 'Fast loading (under 3 seconds)',  detail: 'Test free at pagespeed.web.dev. Slow sites lose visitors and Google ranking.' },
    ],
  },
  {
    title: 'Converting Visitors',
    items: [
      { num: 11, label: 'Clear call to action', detail: 'One obvious next step on every page. "Call now", "Get a quote", "Book online".' },
      { num: 12, label: 'Privacy policy',        detail: 'Required under the Australian Privacy Act for any site collecting personal information.' },
    ],
  },
]

// ── Components ─────────────────────────────────────────────────────────────

function SectionBlock({ title, items }: { title: string; items: CheckItem[] }) {
  return (
    <View>
      <View style={s.sectionHeader}>
        <Text style={s.sectionLabel}>{title}</Text>
        <View style={s.sectionRule} />
      </View>
      {items.map(item => (
        <View key={item.num} style={s.row}>
          <View style={s.checkbox} />
          <View style={{ flex: 1 }}>
            <Text style={s.itemLabel}>
              <Text style={s.numText}>{item.num}. </Text>
              {item.label}
            </Text>
            <Text style={s.itemDetail}>{item.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

function ChecklistDoc({ name }: { name: string }) {
  const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <Document title={`Website Checklist: ${name}`} author="Web F5">
      <Page size="A4" style={s.page}>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.brandRow}>
            <Text style={s.brandName}>Web F5</Text>
          </View>
          <Text style={s.dateLine}>Website Checklist · {date}</Text>
          <Text style={s.heroTitle}>12-Point Website Checklist</Text>
          <Text style={s.heroSub}>
            For Australian small businesses. Tick off what you have and see what needs attention.
          </Text>
          {name && (
            <Text style={s.heroNote}>Prepared for {name}</Text>
          )}
        </View>

        {/* Checklist body */}
        <View style={s.body}>
          {SECTIONS.map(section => (
            <SectionBlock key={section.title} title={section.title} items={section.items} />
          ))}
        </View>

        {/* CTA */}
        <View style={s.cta}>
          <Text style={s.ctaTitle}>Not sure how your site stacks up?</Text>
          <Text style={s.ctaBody}>
            Get a free automated audit of your website in seconds. Speed, SEO, usability, and more — delivered as a full PDF report.
          </Text>
          <View style={s.ctaBtn}>
            <Link src="https://webf5.com.au/audit" style={s.ctaBtnText}>
              Get a free website audit →
            </Link>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View>
            <Text style={s.footerBrand}>Web F5</Text>
            <Text style={s.footerSub}>Web design & development · Central Victoria</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Link src="tel:+61419510206" style={s.footerLink}>0419 510 206</Link>
            <Link src="mailto:contact@webf5.au" style={s.footerEmail}>contact@webf5.au</Link>
          </View>
        </View>

      </Page>
    </Document>
  )
}

export async function renderChecklistPdf(name: string): Promise<Buffer> {
  return renderToBuffer(<ChecklistDoc name={name} />)
}
