// components/sections/HostingPricing.tsx
//
// Displays live hosting, SSL, email, and domain prices pulled from
// the Dreamscape API via /api/hosting/prices.
//
// Falls back to static prices if the API is unavailable so the page
// never shows a broken state to a prospective client.

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Server, Shield, Mail, Globe } from 'lucide-react'

// ── Fallback static prices ───────────────────────────────────────────────────
// Update these if your reseller pricing changes and the API is unavailable.

const FALLBACK = {
  hosting: [
    { name: 'Basic',    price: 9.08,  period: 'month', features: ['1 website', '10GB storage', 'Free SSL'] },
    { name: 'Standard', price: 12.50, period: 'month', features: ['5 websites', '50GB storage', 'Free SSL', 'Daily backups'] },
    { name: 'Business', price: 18.00, period: 'month', features: ['Unlimited websites', '100GB storage', 'Free SSL', 'Priority support'] },
  ],
  ssl:   { name: 'Standard SSL', price: 84,  period: 'year' },
  email: { name: 'Email Hosting', price: 3.50, period: 'month' },
  domains: [
    { tld: '.com.au', price: 23, period: 'year' },
    { tld: '.net.au', price: 23, period: 'year' },
    { tld: '.com',    price: 18, period: 'year' },
    { tld: '.net',    price: 18, period: 'year' },
  ],
}

// ── Types ────────────────────────────────────────────────────────────────────

interface HostingPlan {
  name: string
  price: number
  period: string
  features: string[]
}

interface PricingData {
  hosting: HostingPlan[]
  ssl: { name: string; price: number; period: string }
  email: { name: string; price: number; period: string }
  domains: { tld: string; price: number; period: string }[]
}

// ── Helper ───────────────────────────────────────────────────────────────────

function fmt(price: number) {
  return price % 1 === 0
    ? `$${price}`
    : `$${price.toFixed(2)}`
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-foreground/10 ${className ?? ''}`} />
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HostingCard({ plan, highlighted }: { plan: HostingPlan; highlighted?: boolean }) {
  return (
    <div className={`rounded-lg border p-5 flex flex-col gap-3 ${
      highlighted
        ? 'border-primary/50 bg-primary/5'
        : 'border-border bg-card/50 hover:bg-card'
    } transition-colors`}>
      {highlighted && (
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit">
          Most popular
        </span>
      )}
      <div>
        <p className="font-semibold text-foreground">{plan.name}</p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {fmt(plan.price)}
          <span className="text-sm font-normal text-foreground/50">/{plan.period}</span>
        </p>
      </div>
      <ul className="flex flex-col gap-1.5 text-xs text-foreground/60">
        {plan.features.map(f => (
          <li key={f} className="flex items-center gap-2">
            <span className="text-primary">✓</span>{f}
          </li>
        ))}
      </ul>
    </div>
  )
}

function InfoTile({ icon: Icon, label, value, sub }: {
  icon: React.ElementType
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-4">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-primary" />
      </div>
      <div>
        <p className="text-xs text-foreground/50 mb-0.5">{label}</p>
        <p className="font-semibold text-foreground text-sm">{value}</p>
        <p className="text-xs text-foreground/40">{sub}</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function HostingPricing() {
  const [data, setData]     = useState<PricingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  useEffect(() => {
    fetch('/api/hosting/pricing')
      .then(r => r.json())
      .then(json => {
        // If the API returned data in the expected shape, use it.
        // Otherwise fall back to static prices.
        if (json?.hosting && Array.isArray(json.hosting)) {
          // Map API response to our display shape
          // The exact field names depend on what Dreamscape returns —
          // adjust these if the response shape differs.
          setData({
            hosting: (json.hosting ?? []).map((p: Record<string, unknown>, i: number) => ({
              name:     (p.plan_name as string) ?? FALLBACK.hosting[i]?.name ?? 'Hosting',
              price:    Number(p.price ?? p.register_price ?? FALLBACK.hosting[i]?.price),
              period:   'month',
              features: FALLBACK.hosting[i]?.features ?? [],
            })),
            ssl: {
              name:   'Standard SSL',
              price:  Number((json.ssl?.[0] as Record<string, unknown>)?.price ?? FALLBACK.ssl.price),
              period: 'year',
            },
            email: {
              name:   'Business email hosting',
              price:  Number((json.email?.[0] as Record<string, unknown>)?.price ?? FALLBACK.email.price),
              period: 'month',
            },
            domains: (json.domains ?? FALLBACK.domains).slice(0, 4).map((d: Record<string, unknown>) => ({
              tld:    (d.tld as string) ?? (d.extension as string) ?? '.com.au',
              price:  Number(d.register_price ?? d.price ?? 23),
              period: 'year',
            })),
          })
        } else {
          setData(FALLBACK as unknown as PricingData)
        }
      })
      .catch(() => {
        setError(true)
        setData(FALLBACK as unknown as PricingData)
      })
      .finally(() => setLoading(false))
  }, [])

  // Use fallback immediately if errored
  const display = data ?? FALLBACK as unknown as PricingData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="mt-16 rounded-xl border border-border bg-card/30 p-8"
    >
      {/* Section header */}
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-accent mb-2">
          Hosting, domains & more
        </p>
        <h3 className="text-2xl font-bold text-foreground mb-1">
          Everything your site needs to go live.
        </h3>
        <p className="text-sm text-foreground/55">
          Hosting, domain registration, SSL, and business email — all managed for you.
          {error && (
            <span className="ml-2 text-foreground/35 italic">
              (Showing estimated prices — live pricing temporarily unavailable)
            </span>
          )}
        </p>
      </div>

      {/* Hosting plans */}
      <div className="mb-6">
        <p className="text-xs font-medium text-foreground/50 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Server size={12} /> Web hosting
        </p>
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[0,1,2].map(i => <Skeleton key={i} className="h-36" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {display.hosting.map((plan, i) => (
              <HostingCard key={plan.name} plan={plan} highlighted={i === 1} />
            ))}
          </div>
        )}
      </div>

      {/* SSL, Email, Domains */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoTile
            icon={Shield}
            label="SSL certificate"
            value={`${fmt(display.ssl.price)}/${display.ssl.period}`}
            sub="Secure your site with HTTPS"
          />
          <InfoTile
            icon={Mail}
            label="Business email"
            value={`${fmt(display.email.price)}/${display.email.period}`}
            sub="Professional @yourdomain address"
          />
          {display.domains.slice(0, 2).map(d => (
            <InfoTile
              key={d.tld}
              icon={Globe}
              label={`${d.tld} domain`}
              value={`${fmt(d.price)}/${d.period}`}
              sub="Register or transfer your domain"
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-foreground/35">
        All prices are in AUD and exclude GST. Hosting billed monthly or annually — annual plans attract a discount.
        Domain pricing varies by TLD and registration period.
      </p>
    </motion.div>
  )
}