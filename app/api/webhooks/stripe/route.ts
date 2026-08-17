import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db, courseEntitlements } from '@/lib/db'
import { eq } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const courseId = session.metadata?.courseId

      if (userId && courseId) {
        await db.insert(courseEntitlements).values({
          userId,
          courseId,
          stripePaymentId: session.payment_intent as string ?? session.id,
        }).onConflictDoNothing()
      }
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId = charge.payment_intent as string
      if (paymentIntentId) {
        await db.update(courseEntitlements)
          .set({ refundedAt: new Date() })
          .where(eq(courseEntitlements.stripePaymentId, paymentIntentId))
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
