// app/api/hosting/prices/route.ts
//
// Returns live pricing for the products displayed on the hosting component.
// Cached for 1 hour via Next.js fetch cache — prices don't change frequently
// and we don't want to hit the Dreamscape API on every page load.
//
// Products fetched:
//   Linux Hosting plans 29 (Basic), 30 (Standard), 31 (Business)
//   SSL Certificate plan 65 (Standard SSL)
//   Email Hosting plan 47 (Basic)
//   Domain TLD pricing via /domains/tlds
//
// Response shape: { hosting: Plan[], ssl: Plan[], email: Plan[], domains: TLD[] }

import { NextResponse } from 'next/server'
import { generateDreamscapeAuth, DREAMSCAPE_BASE } from '@/lib/dreamscape-auth'

export const dynamic = 'force-dynamic'

// Plan IDs we want to display — from the product-plans docs
const HOSTING_PLAN_IDS = [29, 30, 31]   // Linux Basic, Standard, Business
const SSL_PLAN_IDS     = [65]            // Standard SSL
const EMAIL_PLAN_IDS   = [47]            // Email Hosting Basic

async function fetchPrices(productType: string, planIds: number[]) {
  const { headers } = generateDreamscapeAuth()
  const params = planIds.map(id => `plan_ids[]=${id}`).join('&')
  const url = `${DREAMSCAPE_BASE}/products/prices?product_type=${productType}&${params}`
    
  const res = await fetch(url, {
    headers,
    next: { revalidate: 3600 }, // cache 1 hour
  })

const [hosting, ssl, email, domains] = await Promise.all([
    fetchPrices('linux_hosting', HOSTING_PLAN_IDS),
    fetchPrices('ssl_certificate', SSL_PLAN_IDS),
    fetchPrices('email_hosting', EMAIL_PLAN_IDS),
    fetchDomainTlds(),
    ])

    // Temporary — remove after verifying field names
console.log('HOSTING RAW:', JSON.stringify(hosting, null, 2))
console.log('SSL RAW:', JSON.stringify(ssl, null, 2))
console.log('EMAIL RAW:', JSON.stringify(email, null, 2))
console.log('DOMAINS RAW:', JSON.stringify(domains, null, 2))

  if (!res.ok) {
    console.error(`Dreamscape prices error [${productType}]:`, res.status, await res.text())
    return null
  }
  return res.json()
}

async function fetchDomainTlds() {
  const { headers } = generateDreamscapeAuth()
  // Fetch pricing for the most common AU TLDs
  const tlds = ['com.au', 'net.au', 'com', 'net', 'co', 'io']
  const params = tlds.map(t => `tlds[]=${t}`).join('&')
  const url = `${DREAMSCAPE_BASE}/domains/tlds?${params}`

  const res = await fetch(url, {
    headers,
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    console.error('Dreamscape TLD pricing error:', res.status, await res.text())
    return null
  }
  return res.json()
}

export async function GET() {
  try {
    // Fire all requests in parallel
    const [hosting, ssl, email, domains] = await Promise.all([
      fetchPrices('linux_hosting', HOSTING_PLAN_IDS),
      fetchPrices('ssl_certificate', SSL_PLAN_IDS),
      fetchPrices('email_hosting', EMAIL_PLAN_IDS),
      fetchDomainTlds(),
    ])

    return NextResponse.json(
      { hosting, ssl, email, domains },
      {
        headers: {
          // Tell the browser it can cache this for 30 minutes
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    )
  } catch (err) {
    console.error('Hosting prices route error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    )
  }
}