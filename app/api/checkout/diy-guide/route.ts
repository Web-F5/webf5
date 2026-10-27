import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const COURSE_ID = 'diy-guide'
const PRICE_CENTS = 2700 // $27.00 AUD

export async function POST() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'aud',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'aud',
            unit_amount: PRICE_CENTS,
            product_data: {
              name: 'Build Your Trade Website in a Weekend',
              description: 'Step-by-step guide: brief → Claude → GitHub → Vercel → domain → email → Google.',
              tax_code: 'txcd_10000000', // General - Electronically Supplied Services
            },
          },
        },
      ],
      metadata: { userId, courseId: COURSE_ID },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://webf5.com.au'}/diy-guide/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://webf5.com.au'}/diy-guide`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[checkout/diy-guide]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
