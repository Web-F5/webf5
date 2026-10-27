import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://webf5.com.au'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'aud',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'aud',
            unit_amount: 1900,
            product_data: {
              name: 'Set Up Your Google Business Profile',
              description: 'Step-by-step guide: create, verify, and fully fill your GBP from scratch.',
              tax_code: 'txcd_10000000',
            },
          },
        },
      ],
      metadata: { userId, courseId: 'gbp-setup' },
      success_url: `${BASE}/guides/gbp-setup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE}/guides/gbp-setup`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[checkout/gbp-setup]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
